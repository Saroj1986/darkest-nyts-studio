import { NextResponse } from "next/server";

function stamp(seconds:number){
  const ms = Math.round((seconds - Math.floor(seconds))*1000);
  let total = Math.floor(seconds);
  const h = Math.floor(total/3600); total %= 3600;
  const m = Math.floor(total/60); const s = total % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(ms).padStart(3,"0")}`;
}

export async function POST(req: Request){
  const { scenes=[] } = await req.json();
  let t=0, out="";
  for(const scene of scenes){
    const d=Number(scene.duration||5);
    const text=String(scene.narration||"").trim();
    if(text){
      out += `${scene.number}\n${stamp(t)} --> ${stamp(t+d)}\n${text}\n\n`;
    }
    t += d;
  }
  return NextResponse.json({srt:out});
}