import {NextResponse} from "next/server";
import {readProject} from "../../../lib/projectStore";

export async function GET(req:Request){
  const id=new URL(req.url).searchParams.get("id");
  if(!id) return NextResponse.json({error:"id required"},{status:400});
  try{return NextResponse.json(await readProject(id))}
  catch{return NextResponse.json({error:"project not found"},{status:404})}
}