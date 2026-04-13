import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { question, context, history } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Build context from search results
    const resultsContext = (context?.results || [])
      .map((r, i) => `${i + 1}. ${r.program_name} at ${r.institution} — ${r.credential || "N/A"}, Domestic: ${r.tuition_domestic || "N/A"}, International: ${r.tuition_international || "N/A"}, Duration: ${r.duration || "N/A"}, Intake: ${r.intake || "N/A"}`)
      .join("\n");

    // Build chat history
    const chatHistory = (history || [])
      .map((m) => `${m.role === "user" ? "Student" : "Advisor"}: ${m.text}`)
      .join("\n");

    const systemPrompt = `You are a helpful Alberta post-secondary education advisor. The student has just searched for "${context?.original_query || "programs"}" and received these results:

${resultsContext}

${chatHistory ? `Previous conversation:\n${chatHistory}\n` : ""}

RULES:
- Answer the student's follow-up question based on the search results above.
- Be concise — 2-4 sentences max.
- If they ask which is cheapest/shortest/best, analyze the data above and give a clear answer.
- If they ask something not in the results, use Google Search to find the answer from official Alberta institution websites.
- Be friendly and helpful. Use plain language.
- If you're not sure, say so honestly and suggest they check the institution's website.`;

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
        tools: [{ googleSearch: {} }],
      },
    });

    const answer = response.text || "Sorry, I couldn't generate an answer.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("[Chat API] Error:", error.message);
    return NextResponse.json({ answer: "Something went wrong. Please try again." }, { status: 500 });
  }
}
