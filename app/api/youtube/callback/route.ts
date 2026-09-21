import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req:Request){
  const code=new URL(req.url).searchParams.get("code");
  if(!code) return NextResponse.json({error:"Missing OAuth code"},{status:400});
  const oauth2=new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const {tokens}=await oauth2.getToken(code);
  const refresh=tokens.refresh_token;
  if(!refresh){
    return NextResponse.json({
      error:"No refresh token returned. Re-authorize with prompt=consent, or revoke the app's access in your Google account and try again."
    },{status:400});
  }
  return new Response(
`<!doctype html><html><body style="font-family:system-ui;padding:40px">
<h2>YouTube connected</h2>
<p>Copy this refresh token into your server environment as <b>YOUTUBE_REFRESH_TOKEN</b>.</p>
<textarea style="width:100%;height:100px">${refresh}</textarea>
<p>Then restart the app. Never share this token publicly.</p>
</body></html>`,
{headers:{"Content-Type":"text/html; charset=utf-8"}});
}