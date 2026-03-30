import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { VERIFIED_PROGRAMS } from "../../lib/verified-programs";

const cache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000;

const DETAIL_PROMPT = (programName, institution) => `
You are an Alberta post-secondary education advisor. Use Google Search to find detailed information about this specific program from the official institution website:

Program: "${programName}"
Institution: "${institution}"

IMPORTANT: Do NOT include tuition fees, duration, intake dates, or semester structure — those are already verified separately.

Focus ONLY on: program description (2-4 sentences), admission requirements, sample course names (at least 5), career outcomes, co-op availability, online availability, accreditation, application deadline, program code, campus, contact email, contact phone, application URL, official program page URL.

Return ONLY valid JSON, no markdown:
{
  "description": "2-4 sentence overview",
  "admission_requirements": "Requirements as plain text",
  "career_outcomes": ["Job title 1", "Job title 2"],
  "courses": ["Course 1", "Course 2", "Course 3"],
  "co_op": true or false or null,
  "online_available": true or false or null,
  "accreditation": "body or null",
  "application_deadline": "date or Rolling or null",
  "program_code": "code or null",
  "campus": "Campus name and city",
  "contact_email": "email or null",
  "contact_phone": "phone or null",
  "application_url": "URL or null",
  "source_url": "Official program page URL"
}
If you cannot find a field, use null.
`;

function findVerifiedProgram(programName, institution) {
  const p = programName.toLowerCase().trim();
  const i = institution.toLowerCase().trim();
  return VERIFIED_PROGRAMS.find((v) => {
    const vp = v.program_name.toLowerCase().trim();
    const vi = v.institution.toLowerCase().trim();
    return (vp === p || p.includes(vp) || vp.includes(p)) &&
           (vi === i || i.includes(vi) || vi.includes(i));
  }) || null;
}

async function fetchRichFromGemini(programName, institution) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key-here") return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: DETAIL_PROMPT(programName, institution),
      config: { temperature: 0.2, tools: [{ googleSearch: {} }] },
    });

    const text = response.text;
    if (!text) return null;

    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return null;
    }

    return {
      description:            parsed.description            || null,
      admission_requirements: parsed.admission_requirements || null,
      career_outcomes:        Array.isArray(parsed.career_outcomes) ? parsed.career_outcomes : [],
      courses:                Array.isArray(parsed.courses)         ? parsed.courses         : [],
      co_op:                  parsed.co_op                  ?? null,
      online_available:       parsed.online_available       ?? null,
      accreditation:          parsed.accreditation          || null,
      application_deadline:   parsed.application_deadline   || null,
      program_code:           parsed.program_code           || null,
      campus:                 parsed.campus                 || null,
      contact_email:          parsed.contact_email          || null,
      contact_phone:          parsed.contact_phone          || null,
      application_url:        parsed.application_url        || null,
      source_url:             parsed.source_url             || null,
    };
  } catch (err) {
    console.error("[program-detail] Gemini error:", err.message);
    return null;
  }
}

export async function POST(request) {
  try {
    const { program_name, institution } = await request.json();

    if (!program_name || !institution) {
      return NextResponse.json(
        { error: "program_name and institution are required." },
        { status: 400 }
      );
    }

    const cacheKey = `${program_name}|${institution}`.toLowerCase().trim();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ ...cached.data, cached: true });
    }

    const verified = findVerifiedProgram(program_name, institution);
    const aiData   = await fetchRichFromGemini(program_name, institution);

    const responseData = {
      program_name:           verified?.program_name          || program_name,
      institution:            verified?.institution           || institution,
      credential:             verified?.credential            || null,
      duration:               verified?.duration              || null,
      tuition_domestic:       verified?.tuition_domestic      || null,
      tuition_international:  verified?.tuition_international || null,
      intake:                 verified?.intake                || null,
      semester_structure:     verified?.semester_structure    || null,
      last_verified:          verified?.last_verified         || null,
      source_url:             aiData?.source_url              || verified?.fee_source_url || null,
      description:            aiData?.description             || null,
      admission_requirements: aiData?.admission_requirements  || null,
      career_outcomes:        aiData?.career_outcomes         || [],
      courses:                aiData?.courses                 || [],
      co_op:                  aiData?.co_op                   ?? null,
      online_available:       aiData?.online_available        ?? null,
      accreditation:          aiData?.accreditation           || null,
      application_deadline:   aiData?.application_deadline    || null,
      program_code:           aiData?.program_code            || null,
      campus:                 aiData?.campus                  || null,
      contact_email:          aiData?.contact_email           || null,
      contact_phone:          aiData?.contact_phone           || null,
      application_url:        aiData?.application_url         || null,
      from_verified:          !!verified,
      from_ai:                !!aiData,
    };

    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    if (cache.size > 500) cache.delete(cache.keys().next().value);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[program-detail] ERROR:", error.message);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}