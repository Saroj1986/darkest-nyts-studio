import {NextResponse} from "next/server";
import {google} from "googleapis";
import fs from "node:fs";

export async function POST(req:Request){
  try{
    const body=await req.json();
    const filePath=String(body.filePath||"");
    const title=String(body.title||"Darkest Nyts");
    const description=String(body.description||"");
    const tags=Array.isArray(body.tags)?body.tags.map(String):[];
    const privacy=body.privacyStatus==="public"?"public":body.privacyStatus==="unlisted"?"unlisted":"private";

    if(!process.env.YOUTUBE_REFRESH_TOKEN) return NextResponse.json({error:"YouTube is not connected."},{status:400});
    if(!filePath || !fs.existsSync(filePath)) return NextResponse.json({error:"Server-side video file not found."},{status:400});

    const auth=new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,process.env.GOOGLE_REDIRECT_URI);
    auth.setCredentials({refresh_token:process.env.YOUTUBE_REFRESH_TOKEN});
    const youtube=google.youtube({version:"v3",auth});

    const result=await youtube.videos.insert({
      part:["snippet","status"],
      requestBody:{
        snippet:{title,description,tags,categoryId:"24",defaultLanguage:"hi"},
        status:{privacyStatus:privacy,selfDeclaredMadeForKids:false}
      },
      media:{body:fs.createReadStream(filePath)}
    });

    return NextResponse.json({uploaded:true,videoId:result.data.id,privacyStatus:privacy});
  }catch(e:any){
    return NextResponse.json({error:e?.message||"YouTube upload failed"},{status:500});
  }
}