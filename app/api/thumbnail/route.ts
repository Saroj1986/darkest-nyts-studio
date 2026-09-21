import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

    const result = await client.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
      prompt: String(prompt) + "\nYouTube thumbnail composition, 16:9, dramatic focal point, readable negative space, no tiny text.",
      size: "1536x1024"
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("Thumbnail generation returned no image data");

    return NextResponse.json({ dataUrl: `data:image/png;base64,${b64}` });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Thumbnail generation failed" }, { status: 500 });
  }
}