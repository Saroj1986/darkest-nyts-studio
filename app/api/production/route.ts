import { NextResponse } from "next/server";
import OpenAI from "openai";
import crypto from "node:crypto";
import { saveProject } from "../../../lib/projectStore";

const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});

export async function POST(req:Request){
  try{
    const {topic,language="Hindi",duration="10 minutes"}=await req.json();
    const id=crypto.randomUUID();

    const prompt=`Create a production-ready horror video package for Darkest Nyts.
Topic: ${topic || "an unexplained Indian night incident"}
Language: ${language}
Duration: ${duration}
Return JSON:
{"title":"","hook":"","script":"","scenes":[{"number":1,"duration":10,"narration":"","visualPrompt":""}],"shorts":["","",""],"thumbnailPrompt":""}
Keep it cinematic, suspenseful and practical for faceless video generation. Do not present fiction as verified fact.`;

    const r=await client.responses.create({
      model:process.env.OPENAI_TEXT_MODEL || "gpt-5.6-luna",
      input:prompt
    });
    let t=r.output_text.trim().replace(/^```json\s*/i,"").replace(/\s*```$/i,"");
    const pkg=JSON.parse(t);
    const project={id,status:"assets_pending",createdAt:new Date().toISOString(),topic,language,duration,...pkg};
    await saveProject(id,project);
    return NextResponse.json(project);
  }catch(e:any){
    return NextResponse.json({error:e?.message||"Production generation failed"},{status:500});
  }
}