import {NextResponse} from "next/server";
import {createJob,listJobs} from "../../../lib/jobStore";

export async function GET(){ return NextResponse.json(await listJobs()); }

export async function POST(req:Request){
  try{
    const body=await req.json();
    const job=await createJob(String(body.type||"render"),body.payload||{},body.runAt);
    return NextResponse.json(job);
  }catch(e:any){return NextResponse.json({error:e?.message||"Could not create job"},{status:500});}
}