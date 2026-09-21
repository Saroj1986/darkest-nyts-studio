import {NextResponse} from "next/server";
import {listJobs,updateJob} from "../../../lib/jobStore";

export async function POST(){
  const now=Date.now();
  const jobs=await listJobs();
  const pending=jobs.find((j:any)=>j.status==="queued" && new Date(j.runAt).getTime()<=now);
  if(!pending) return NextResponse.json({ran:false,message:"No due jobs."});

  await updateJob(pending.id,{
    status:"running",
    startedAt:new Date().toISOString(),
    attempts:Number(pending.attempts||0)+1
  });

  await updateJob(pending.id,{
    status:"awaiting_worker",
    message:"Job claimed. Worker can process this job."
  });

  return NextResponse.json({ran:true,jobId:pending.id,status:"awaiting_worker"});
}