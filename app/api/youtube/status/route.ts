import {NextResponse} from "next/server";
import {google} from "googleapis";

export async function GET(){
  if(!process.env.YOUTUBE_REFRESH_TOKEN){
    return NextResponse.json({connected:false,message:"YouTube is not connected."});
  }
  try{
    const auth=new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,process.env.GOOGLE_REDIRECT_URI);
    auth.setCredentials({refresh_token:process.env.YOUTUBE_REFRESH_TOKEN});
    const youtube=google.youtube({version:"v3",auth});
    const r=await youtube.channels.list({part:["snippet"],mine:true});
    const channel=r.data.items?.[0];
    return NextResponse.json({connected:!!channel,channelId:channel?.id||null,channelTitle:channel?.snippet?.title||null});
  }catch(e:any){
    return NextResponse.json({connected:false,message:e?.message||"YouTube status failed"},{status:500});
  }
}