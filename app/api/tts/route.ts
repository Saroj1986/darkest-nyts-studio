import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

    const audio = await client.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: process.env.OPENAI_TTS_VOICE || "marin",
      input: String(text),
      response_format: "mp3"
    });

    const buffer = Buffer.from(await audio.arrayBuffer());
    return new NextResponse(buffer, {
      headers: { "Content-Type": "audio/mpeg", "Content-Length": String(buffer.length) }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "TTS generation failed" }, { status: 500 });
  }
}