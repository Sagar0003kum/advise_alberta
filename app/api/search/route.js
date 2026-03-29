import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { searchVerifiedPrograms } from "../../lib/verified-programs";

// ── In-memory cache ─────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ── System instruction for Gemini ───────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are an Alberta post-secondary education advisor. When the user asks about programs/courses, use Google Search grounding to find REAL, CURRENT information from Alberta post-secondary institutions.

IMPORTANT RULES:
- Only report programs from Alberta institutions: SAIT, NAIT, University of Calgary, University of Alberta, Mount Royal University, Bow Valley College, MacEwan University, University of Lethbridge, Red Deer Polytechnic, Lethbridge Polytechnic, NorQuest College, Medicine Hat College, Olds College, Lakeland College, Keyano College, Northwestern Polytechnic, Concordia University of Edmonton, Athabasca University, Portage College, Northern Lakes College, Alberta University of the Arts, Ambrose University, Burman University, St. Mary's University, The King's University, Banff Centre for Arts and Creativity.
- Search MULTIPLE institutions to give comprehensive results (at least 3-5 different institutions).
- For each program found, include: program name, institution name (full official name), credential type (Diploma/Degree/Certificate/Post-Diploma), tuition (domestic & international if available), duration, intake dates, semester structure if found, and the direct URL to the program page on the institution's official website.

TUITION FEE SEARCH STRATEGY (VERY IMPORTANT):
- You MUST make a strong effort to find actual dollar amounts for tuition fees. Do NOT default to "Contact institution" unless you truly cannot find any fee data.
- Step 1: Check the program page itself for fee information.
- Step 2: If not on the program page, search for "[institution name] tuition fees [program name]" specifically.
- Step 3: If still not found, search for "[institution name] tuition fee schedule" or "[institution name] domestic tuition rates" to find the institution's general fee schedule page.
- Step 4: Many Alberta institutions publish per-credit or per-semester fee schedules. If you find per-credit rates, calculate the approximate total (e.g., "$150/credit x 60 credits = ~$9,000 total").
- Step 5: If you find an annual tuition amount, multiply by duration to estimate total program cost and label it clearly (e.g., "~$8,400/year" or "~$16,800 total (2 years)").
- It is MUCH better to provide an approximate fee with a "~" prefix and note like "(approx, verify with institution)" than to say "Contact institution for current fees".
- Only use "Contact institution for current fees" as an absolute last resort when no fee data exists anywhere online for that program.

SKIP THESE PROGRAMS (already in our verified database — do NOT include them in your results):
SKIP_LIST_PLACEHOLDER

- If no programs match the query, return an empty results array.
- Return results ranked by relevance to the user's query.

RESPONSE FORMAT — return ONLY valid JSON, no markdown backticks, no explanation before or after:
{
  "results": [
    {
      "program_name": "Program Name",
      "institution": "Full Institution Name",
      "credential": "Diploma",
      "duration": "2 years",
      "tuition_domestic": "$X,XXX/year (approx)",
      "tuition_international": "$XX,XXX/year (approx)",
      "intake": "September, January",
      "semester_structure": "Fall and Winter semesters",
      "match_reason": "Brief reason why this matches the query",
      "source_url": "https://www.institution.ca/programs/..."
    }
  ],
  "summary": "Brief 2-sentence summary of findings",
  "disclaimer": "Fees and availability shown are sourced in real-time from official institution websites. Approximate fees are marked with ~. Always verify directly with the institution before applying."
}`;

// ── Cache key generator ─────────────────────────────────────────────────
function getCacheKey(query) {
  return query.toLowerCase().trim().replace(/\s+/g, " ");
}

// ── POST handler ────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { query } = await request.json();

    // ── Validate input ──────────────────────────────────────────────
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Please provide a search query." }, { status: 400 });
    }

    if (query.trim().length > 500) {
      return NextResponse.json({ error: "Search query is too long. Please keep it under 500 characters." }, { status: 400 });
    }

    // ── Check cache ─────────────────────────────────────────────────
    const cacheKey = getCacheKey(query);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
        cached_at: new Date(cached.timestamp).toISOString(),
      });
    }

    // ══════════════════════════════════════════════════════════════════
    // STEP 1: Search verified database FIRST
    // ══════════════════════════════════════════════════════════════════
    const verifiedResults = searchVerifiedPrograms(query);

    console.log(`[Search API] Found ${verifiedResults.length} verified programs for: "${query}"`);

    // ══════════════════════════════════════════════════════════════════
    // STEP 2: Call Gemini for additional programs NOT in our database
    // ══════════════════════════════════════════════════════════════════
    let aiResults = [];
    let aiSummary = "";

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your-gemini-api-key-here") {
      // No API key — return only verified results
      if (verifiedResults.length === 0) {
        return NextResponse.json(
          { error: "API key not configured and no verified programs found." },
          { status: 500 }
        );
      }
    } else {
      // Build skip list so AI doesn't duplicate verified results
      const skipList = verifiedResults
        .map((r) => `${r.program_name} at ${r.institution}`)
        .join(", ");

      const systemPrompt = SYSTEM_INSTRUCTION.replace(
        "SKIP_LIST_PLACEHOLDER",
        skipList || "(none)"
      );

      try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Search for Alberta post-secondary programs matching this query: "${query.trim()}"`,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
            tools: [{ googleSearch: {} }],
          },
        });

        const responseText = response.text;

        if (responseText) {
          let parsed;
          try {
            const cleanText = responseText
              .replace(/```json\s*/g, "")
              .replace(/```\s*/g, "")
              .trim();
            parsed = JSON.parse(cleanText);
          } catch {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try { parsed = JSON.parse(jsonMatch[0]); } catch { parsed = null; }
            }
          }

          if (parsed) {
            aiResults = Array.isArray(parsed.results)
              ? parsed.results.map((r) => ({
                  program_name: r.program_name || "Unknown Program",
                  institution: r.institution || "Unknown Institution",
                  credential: r.credential || null,
                  duration: r.duration || null,
                  tuition_domestic: r.tuition_domestic || null,
                  tuition_international: r.tuition_international || null,
                  intake: r.intake || null,
                  semester_structure: r.semester_structure || null,
                  match_reason: r.match_reason || null,
                  source_url: r.source_url || null,
                  verified: false,
                }))
              : [];

            aiSummary = parsed.summary || "";
          }
        }
      } catch (aiError) {
        console.error("[Search API] Gemini error:", aiError.message);
        // If AI fails but we have verified results, continue without AI
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // STEP 3: Merge results — verified FIRST, then AI results
    // ══════════════════════════════════════════════════════════════════
    const allResults = [...verifiedResults, ...aiResults];

    // Deduplicate: if AI returned a program that's also in verified DB, keep verified
    const seen = new Set();
    const dedupedResults = allResults.filter((r) => {
      const key = `${r.program_name}|${r.institution}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const verifiedCount = dedupedResults.filter((r) => r.verified).length;
    const aiCount = dedupedResults.length - verifiedCount;

    const summary = verifiedCount > 0
      ? `Found ${verifiedCount} program${verifiedCount !== 1 ? "s" : ""} with verified fees and ${aiCount} additional program${aiCount !== 1 ? "s" : ""} from AI search. ${aiSummary}`
      : aiSummary || `Found ${dedupedResults.length} programs matching your search.`;

    const responseData = {
      results: dedupedResults,
      summary,
      disclaimer:
        "Programs marked ✓ Verified have manually confirmed fees. Other fees are AI-sourced from official websites and marked with ~ for estimates. Always verify directly with the institution before applying.",
      searched_at: new Date().toISOString(),
      cached: false,
      stats: {
        verified: verifiedCount,
        ai_sourced: aiCount,
        total: dedupedResults.length,
      },
    };

    // ── Cache ────────────────────────────────────────────────────────
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    if (cache.size > 500) {
      cache.delete(cache.keys().next().value);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Search API] ERROR:", error.message);
    return NextResponse.json(
      { error: `Error: ${error.message || "An unexpected error occurred."}` },
      { status: 500 }
    );
  }
}
