import {NextResponse} from "next/server";
import OpenAI from "openai";
import crypto from "node:crypto";
import {saveProject} from "../../lib/projectStore";


function durationToSeconds(value:string){
  const v=String(value||"").toLowerCase().trim();
  const sec=v.match(/(\d+)\s*seconds?/);
  if(sec)return Number(sec[1]);
  const min=v.match(/(\d+)\s*minutes?/);
  if(min)return Number(min[1])*60;
  return 60;
}

function normalizeScenes(scenes:any[], totalSeconds:number){
  const count=Math.max(1,Math.ceil(totalSeconds/10));
  const source=Array.isArray(scenes)?scenes:[];
  const result=[];
  for(let i=0;i<count;i++){
    const base=source[i]||source[source.length-1]||{};
    result.push({
      number:i+1,
      duration:i===count-1?Math.max(1,totalSeconds-(count-1)*10):10,
      narration:String(base.narration||""),
      visualPrompt:String(base.visualPrompt||"")
    });
  }
  return result;
}
export async function POST(req:Request){
  try{
    const apiKey=process.env.OPENAI_API_KEY;

    if(!apiKey){
      return NextResponse.json(
        {error:"OPENAI_API_KEY is not configured. Add it to .env.local for local use or Vercel Environment Variables for deployment."},
        {status:500}
      );
    }

    // Create the client only when the API route is actually called.
    // This allows `next build` to run without an OpenAI key.
    const client=new OpenAI({apiKey});

    const {topic,language="Hindi",duration="10 minutes"}=await req.json();
    const id=crypto.randomUUID();

    const prompt=`Create a production-ready cinematic horror package for the YouTube channel Darkest Nyts.
Topic: ${topic||"an unexplained Indian night incident"}
Language: ${language}
Duration: ${duration}
Return ONLY JSON with title, hook, script, scenes, shorts and thumbnailPrompt.
Scene format: {"number":1,"duration":10,"narration":"","visualPrompt":""}.
Do not present fictional material as verified fact.`;

    const response=await client.responses.create({
      model:process.env.OPENAI_TEXT_MODEL||"gpt-5.6-luna",
      input:prompt
    });

    const raw=response.output_text
      .trim()
      .replace(/^```json\s*/i,"")
      .replace(/\s*```$/i,"");

    const pkg=JSON.parse(raw);
    const totalSeconds=durationToSeconds(duration);
    pkg.scenes=normalizeScenes(pkg.scenes,totalSeconds);

    const project={
      id,
      status:"assets_pending",
      createdAt:new Date().toISOString(),
      topic,
      language,
      duration,
      ...pkg
    };

    await saveProject(id,project);
    return NextResponse.json(project);
  }catch(e:any){
    return NextResponse.json(
      {error:e?.message||"Production generation failed"},
      {status:500}
    );
  }
}