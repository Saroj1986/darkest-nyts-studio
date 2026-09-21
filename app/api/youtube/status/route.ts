import {NextResponse} from "next/server";
import {google} from "googleapis";

export async function GET(){
  const refresh=process.env.YOUTUBE_REFRESH_TOKEN;
  if(!refresh) return NextResponse.json({connected:false,message:"YouTube is not connected. Use /api/youtube/auth."});

  try{
    const auth=new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,process.env.GOOGLE_REDIRECT_URI);
    auth.setCredentials({refresh_token:refresh});
    const youtube=google.youtube({version:"v3",auth});
    const r=await youtube.channels.list({part:["snippet","contentDetails"],mine:true});
    const channel=r.data.items?.[0];
    return NextResponse.json({
      connected:!!channel,
      channelId:channel?.id||null,
      channelTitle:channel?.snippet?.title||null
    });
  }catch(e:any){
    return NextResponse.json({connected:false,message:e?.message||"YouTube check failed"},{status:500});
  }
}