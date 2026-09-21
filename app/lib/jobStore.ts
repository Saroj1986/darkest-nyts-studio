import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.join(process.cwd(), "projects", "jobs");

async function ensure(){ await fs.mkdir(ROOT,{recursive:true}); }

export async function createJob(type:string,payload:any,runAt?:string){
  await ensure();
  const id=crypto.randomUUID();
  const job={id,type,payload,status:"queued",createdAt:new Date().toISOString(),runAt:runAt||new Date().toISOString(),attempts:0};
  await fs.writeFile(path.join(ROOT,`${id}.json`),JSON.stringify(job,null,2),"utf8");
  return job;
}
export async function listJobs(){
  await ensure();
  const files=await fs.readdir(ROOT);
  const jobs:any[]=[];
  for(const file of files.filter(x=>x.endsWith(".json"))){
    try{jobs.push(JSON.parse(await fs.readFile(path.join(ROOT,file),"utf8")))}catch{}
  }
  return jobs.sort((a,b)=>String(a.runAt).localeCompare(String(b.runAt)));
}
export async function updateJob(id:string,patch:any){
  await ensure();
  const file=path.join(ROOT,`${id}.json`);
  const current=JSON.parse(await fs.readFile(file,"utf8"));
  const next={...current,...patch};
  await fs.writeFile(file,JSON.stringify(next,null,2),"utf8");
  return next;
}