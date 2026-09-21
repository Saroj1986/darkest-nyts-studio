import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt, size = "1536x1024" } = await req.json();
    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

    const result = await client.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
      prompt: String(prompt),
      size
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("Image model returned no image data");

    return NextResponse.json({
      mimeType: "image/png",
      dataUrl: `data:image/png;base64,${b64}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Image generation failed" },
      { status: 500 }
    );
  }
}