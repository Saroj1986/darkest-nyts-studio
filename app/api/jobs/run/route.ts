import {NextResponse} from "next/server";
import {listJobs,updateJob} from "../../../../lib/jobStore";

export async function POST(){
  const now=Date.now();
  const jobs=await listJobs();
  const pending=jobs.find(j=>j.status==="queued" && new Date(j.runAt).getTime()<=now);
  if(!pending) return NextResponse.json({ran:false,message:"No due jobs."});

  await updateJob(pending.id,{status:"running",startedAt:new Date().toISOString(),attempts:Number(pending.attempts||0)+1});

  // The actual FFmpeg/asset/upload work is intentionally delegated to a worker.
  // This endpoint establishes the job lifecycle without blocking the web request.
  await updateJob(pending.id,{status:"awaiting_worker",message:"Job claimed. Run the production worker for this job."});
  return NextResponse.json({ran:true,jobId:pending.id,status:"awaiting_worker"});
}