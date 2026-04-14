import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { grades, interests, city, budget, credential, description } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const prompt = `You are an Alberta post-secondary education advisor. A student is looking for program recommendations.

STUDENT PROFILE:
- Interests: ${interests?.join(", ") || "Not specified"}
- Grades/GPA: ${grades || "Not specified"}
- Preferred city: ${city || "Any"}
- Budget: ${budget || "Flexible"}
- Credential preference: ${credential || "Any"}
- Additional info: ${description || "None"}

Based on this profile, recommend 5-8 programs from real Alberta post-secondary institutions (SAIT, NAIT, University of Calgary, University of Alberta, Bow Valley College, Mount Royal University, MacEwan University, University of Lethbridge, NorQuest College, Medicine Hat College, etc.).

For each recommendation, estimate an admission probability percentage based on their grades and the program's typical admission requirements.

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no backticks, just raw JSON):
[
  {
    "program": "Program Name",
    "institution": "Full Institution Name",
    "match": 85,
    "reason": "Why this is a good fit (1-2 sentences)",
    "tuition": "$X,XXX/year",
    "duration": "X years",
    "admission": "Likely/Competitive/Reach"
  }
]

Sort by match percentage (highest first). Be realistic with admission estimates.`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.3, tools: [{ googleSearch: {} }] },
    });

    let text = response.text || "[]";
    text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let recommendations;
    try { recommendations = JSON.parse(text); } catch { recommendations = []; }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("[Match API]", error.message);
    return NextResponse.json({ recommendations: [] }, { status: 500 });
  }
}
