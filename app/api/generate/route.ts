import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "An unexplained Indian horror incident");
    const language = String(body.language || "Hindi");
    const duration = String(body.duration || "10 minutes");

    const prompt = `You are the content engine for the YouTube channel "Darkest Nyts".
Create a cinematic faceless horror production package.

Topic: ${topic}
Language: ${language}
Duration: ${duration}

Return ONLY valid JSON with:
{
  "title": "string",
  "hook": "string",
  "script": "string",
  "scenes": [
    {"number": 1, "duration": 10, "narration": "string", "visualPrompt": "string"}
  ],
  "shorts": ["string","string","string"],
  "thumbnailPrompt": "string"
}

Rules:
- Strong opening hook.
- Suspenseful pacing.
- Indian setting where appropriate.
- Do not claim a fictional story is a verified true event.
- Keep scene narration concise and cinematic.
- Visual prompts must describe subject, environment, camera, lighting and mood.
- Use the requested language for title, hook, script and narration.
- Make enough scenes to cover the requested duration approximately.
- Keep the output practical for an AI video production pipeline.`;

    const response = await client.responses.create({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-5.6-luna",
      input: prompt
    });

    let text = response.output_text.trim();
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "AI generation failed. Check OPENAI_API_KEY and model access." },
      { status: 500 }
    );
  }
}