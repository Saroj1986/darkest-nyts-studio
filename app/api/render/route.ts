import {NextResponse} from "next/server";
import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {readProject, saveProject} from "../../lib/projectStore";

export const runtime="nodejs";
export const maxDuration=300;

const execFileAsync=promisify(execFile);
const ROOT=path.join(process.cwd(),"public","generated");

function safeName(value:string){
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,70)||"darkest-nyts";
}
async function ensureDir(dir:string){await fs.mkdir(dir,{recursive:true});}

async function generateImage(apiKey:string,prompt:string){
  const response=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},
    body:JSON.stringify({
      model:process.env.OPENAI_IMAGE_MODEL||"gpt-5.6-luna",
      tools:[{
        type:"image_generation",
        model:process.env.OPENAI_IMAGE_GENERATOR||"gpt-image-2",
        size:"1536x1024",
        quality:process.env.OPENAI_IMAGE_QUALITY||"medium",
        output_format:"png"
      }],
      tool_choice:"required",
      input:prompt
    })
  });
  const data:any=await response.json();
  if(!response.ok) throw new Error(data?.error?.message||`Image generation failed (${response.status})`);
  const call=(data.output||[]).find((item:any)=>item.type==="image_generation_call" && item.result);
  if(!call?.result) throw new Error("OpenAI returned no generated image data.");
  return Buffer.from(call.result,"base64");
}

async function generateSpeech(client:OpenAI,input:string){
  if(input.length>4096) throw new Error("A scene narration is longer than the TTS 4096-character limit. Regenerate the project with shorter scene narration.");
  const audio=await client.audio.speech.create({
    model:process.env.OPENAI_TTS_MODEL||"gpt-4o-mini-tts",
    voice:(process.env.OPENAI_TTS_VOICE||"onyx") as any,
    input:input||"Darkest Nyts.",
    instructions:"Speak in natural Hindi with a deep, cinematic, suspenseful documentary voice. Keep the pacing clear and controlled. Do not add words that are not in the input.",
    response_format:"mp3"
  });
  return Buffer.from(await audio.arrayBuffer());
}

async function runFfmpeg(args:string[]){
  const binary=process.env.FFMPEG_PATH||"ffmpeg";
  try{
    await execFileAsync(binary,["-version"],{maxBuffer:2*1024*1024});
  }catch{
    throw new Error("FFmpeg is not installed or not found. On macOS install it with: brew install ffmpeg. Then restart the dev server.");
  }
  await execFileAsync(binary,args,{maxBuffer:20*1024*1024});
}

export async function POST(req:Request){
  try{
    const apiKey=process.env.OPENAI_API_KEY;
    if(!apiKey) return NextResponse.json({error:"OPENAI_API_KEY is not configured."},{status:500});
    const body=await req.json();
    const projectId=String(body.projectId||"");
    const aspect=body.aspect==="9:16"?"9:16":"16:9";
    if(!projectId) return NextResponse.json({error:"projectId is required"},{status:400});

    const project:any=await readProject(projectId);
    const scenes=Array.isArray(project.scenes)?project.scenes:[];
    if(!scenes.length) return NextResponse.json({error:"Project has no scenes."},{status:400});

    const client=new OpenAI({apiKey});
    const id=crypto.randomUUID();
    const slug=safeName(project.title||project.topic||"darkest-nyts");
    const dir=path.join(ROOT,`${slug}-${id}`);
    await ensureDir(dir);
    const clips:string[]=[];

    for(let i=0;i<scenes.length;i++){
      const scene=scenes[i];
      const duration=Math.max(1,Number(scene.duration)||10);
      const narration=String(scene.narration||"").replace(/\r?\n/g," ").trim();
      const visualPrompt=`Darkest Nyts cinematic horror visual. ${String(scene.visualPrompt||scene.narration||project.topic)}. Indian setting, eerie atmosphere, dramatic moonlight and practical lantern light, subtle fog, realistic cinematic 3D illustration, detailed environment, suspenseful composition, no text, no logos, no watermark. ${aspect==="9:16"?"Vertical composition, 9:16 framing.":"Widescreen composition, 16:9 framing."}`;

      const image=await generateImage(apiKey,visualPrompt);
      const imagePath=path.join(dir,`scene-${String(i+1).padStart(2,"0")}.png`);
      await fs.writeFile(imagePath,image);

      const audio=await generateSpeech(client,narration);
      const audioPath=path.join(dir,`scene-${String(i+1).padStart(2,"0")}.mp3`);
      await fs.writeFile(audioPath,audio);

      const clipPath=path.join(dir,`scene-${String(i+1).padStart(2,"0")}.mp4`);
      const scale=aspect==="9:16"?"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920":"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080";
      await runFfmpeg([
        "-y","-loop","1","-i",imagePath,"-i",audioPath,
        "-t",String(duration),"-vf",`${scale},format=yuv420p`,"-r","30",
        "-c:v","libx264","-preset","veryfast","-crf","22","-c:a","aac","-b:a","192k","-ar","48000",clipPath
      ]);

      clips.push(clipPath);
    }

    const concatPath=path.join(dir,"concat.txt");
    await fs.writeFile(concatPath,clips.map(p=>`file '${p.replace(/'/g,"'\\''")}'`).join("\n"),"utf8");
    const joinedPath=path.join(dir,"joined.mp4");
    await runFfmpeg(["-y","-f","concat","-safe","0","-i",concatPath,"-c","copy",joinedPath]);

    // Subtitles/caption burn-in is intentionally disabled in V1.0.3.
    // The joined MP4 is already a complete video with narration audio.
    // This avoids FFmpeg/libass subtitle-filter compatibility problems.
    const finalPath=path.join(dir,`${slug}-${aspect==="9:16"?"short":"video"}.mp4`);
    await fs.copyFile(joinedPath,finalPath);

    const publicUrl=`/generated/${path.basename(dir)}/${path.basename(finalPath)}`;
    const updated={...project,status:"rendered",videoUrl:publicUrl,aspect,renderedAt:new Date().toISOString(),assetsDir:`/generated/${path.basename(dir)}/`};
    await saveProject(projectId,updated);
    return NextResponse.json({ok:true,project:updated,videoUrl:publicUrl});
  }catch(e:any){
    return NextResponse.json({error:e?.message||"Video rendering failed"},{status:500});
  }
}
