import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

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

// ── Institution search URL fallbacks ────────────────────────────────────
// If the AI-generated URL is broken, we fall back to searching the
// institution's own website for the program name — guaranteed to work.
const INSTITUTION_SEARCH = {
  "sait": "https://www.sait.ca/search#q=",
  "nait": "https://www.nait.ca/search#q=",
  "university of calgary": "https://www.ucalgary.ca/search?q=",
  "university of alberta": "https://www.ualberta.ca/search?q=",
  "mount royal": "https://www.mtroyal.ca/search.htm?q=",
  "bow valley": "https://bowvalleycollege.ca/?s=",
  "macewan": "https://www.macewan.ca/search/?q=",
  "university of lethbridge": "https://www.ulethbridge.ca/search?q=",
  "red deer": "https://rdpolytech.ca/?s=",
  "norquest": "https://www.norquest.ca/search.aspx?q=",
  "lethbridge poly": "https://lethpolytech.ca/?s=",
  "medicine hat": "https://www.mhc.ab.ca/search?q=",
  "olds college": "https://www.oldscollege.ca/?s=",
  "lakeland": "https://www.lakelandcollege.ca/?s=",
  "keyano": "https://www.keyano.ca/search?q=",
  "northwestern": "https://nwpolytech.ca/?s=",
  "concordia": "https://concordia.ab.ca/?s=",
  "athabasca": "https://www.athabascau.ca/search/index.html?q=",
  "portage": "https://www.portagecollege.ca/?s=",
  "northern lakes": "https://www.northernlakescollege.ca/?s=",
  "alberta university of the arts": "https://www.auarts.ca/?s=",
  "ambrose": "https://ambrose.edu/?s=",
  "burman": "https://www.burmanu.ca/?s=",
  "st. mary": "https://stmu.ca/?s=",
  "king's": "https://www.kingsu.ca/?s=",
  "banff centre": "https://www.banffcentre.ca/search?query=",
};

function getSearchFallbackUrl(institution, programName) {
  const instLower = (institution || "").toLowerCase();
  for (const [key, searchUrl] of Object.entries(INSTITUTION_SEARCH)) {
    if (instLower.includes(key)) {
      return searchUrl + encodeURIComponent(programName || "programs");
    }
  }
  // Ultimate fallback: Google site search
  return `https://www.google.com/search?q=${encodeURIComponent(
    `${programName} ${institution} Alberta`
  )}`;
}

// ── URL validation (HEAD request with timeout) ──────────────────────────
async function validateUrl(url) {
  if (!url || !url.startsWith("http")) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "AlbertaFinder/1.0 (URL Validator)" },
    });
    clearTimeout(timeout);
    return res.ok; // true if 200-299
  } catch {
    return false;
  }
}

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
      return NextResponse.json(
        { error: "Please provide a search query." },
        { status: 400 }
      );
    }

    if (query.trim().length > 500) {
      return NextResponse.json(
        { error: "Search query is too long. Please keep it under 500 characters." },
        { status: 400 }
      );
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

    // ── Call Gemini API ─────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your-gemini-api-key-here") {
      console.error("GEMINI_API_KEY is not set or still has placeholder value");
      return NextResponse.json(
        { error: "API key not configured. Please add your Gemini API key to .env.local" },
        { status: 500 }
      );
    }

    console.log("[Search API] Starting search for:", query.trim());
    console.log("[Search API] API key starts with:", apiKey.substring(0, 8) + "...");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for Alberta post-secondary programs matching this query: "${query.trim()}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        tools: [{ googleSearch: {} }],
      },
    });

    console.log("[Search API] Gemini response received");

    // ── Extract response text ───────────────────────────────────────
    const responseText = response.text;

    if (!responseText) {
      console.error("[Search API] No text in response:", JSON.stringify(response.candidates?.[0], null, 2));
      return NextResponse.json(
        { error: "No results could be generated. Please try a different search." },
        { status: 500 }
      );
    }

    console.log("[Search API] Response text length:", responseText.length);
    console.log("[Search API] Response preview:", responseText.substring(0, 200));

    // ── Parse JSON from Gemini's response ───────────────────────────
    let parsed;
    try {
      // Clean potential markdown fences
      const cleanText = responseText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("[Search API] JSON parse error:", parseError.message);
      console.error("[Search API] Raw response (first 500 chars):", responseText.substring(0, 500));

      // Try to extract JSON object from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
          console.log("[Search API] Extracted JSON from response successfully");
        } catch {
          return NextResponse.json(
            { error: "Could not parse search results. Please try rephrasing your search." },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Could not parse search results. Please try rephrasing your search." },
          { status: 500 }
        );
      }
    }

    // ── Extract grounding sources from Gemini metadata ──────────────
    let groundingSources = [];
    try {
      const metadata = response.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        groundingSources = metadata.groundingChunks
          .filter((chunk) => chunk.web)
          .map((chunk) => ({
            title: chunk.web.title || "",
            url: chunk.web.uri || "",
          }));
      }
    } catch (e) {
      console.log("[Search API] Could not extract grounding metadata:", e.message);
    }

    // ── Validate and sanitize results ───────────────────────────────
    const responseData = {
      results: Array.isArray(parsed.results)
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
          }))
        : [],
      summary: parsed.summary || "",
      disclaimer:
        parsed.disclaimer ||
        "Fees and availability shown are sourced in real-time from official institution websites. Always verify directly with the institution before applying.",
      grounding_sources: groundingSources,
      searched_at: new Date().toISOString(),
      cached: false,
    };

    console.log("[Search API] Returning", responseData.results.length, "results");

    // ── Store in cache ──────────────────────────────────────────────
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    if (cache.size > 500) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    // ── Detailed error logging ──────────────────────────────────────
    console.error("[Search API] ERROR:", error.message);
    console.error("[Search API] Error name:", error.name);
    console.error("[Search API] Error status:", error.status || error.statusCode);
    console.error("[Search API] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    if (error?.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your GEMINI_API_KEY in .env.local" },
        { status: 401 }
      );
    }

    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again. Free tier allows 500 grounded searches per day." },
        { status: 429 }
      );
    }

    if (error?.message?.includes("not found") || error?.message?.includes("model")) {
      return NextResponse.json(
        { error: `Model error: ${error.message}. Try changing the model name in route.js` },
        { status: 500 }
      );
    }

    if (error?.message?.includes("PERMISSION_DENIED") || error?.message?.includes("403")) {
      return NextResponse.json(
        { error: "Permission denied. Make sure Google Search grounding is enabled for your API key. Try creating a new key at aistudio.google.com/apikey" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: `Error: ${error.message || "An unexpected error occurred. Please try again."}` },
      { status: 500 }
    );
  }
}
