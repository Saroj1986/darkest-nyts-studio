import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "projects");

export async function saveProject(id:string, data:any){
  await fs.mkdir(ROOT,{recursive:true});
  await fs.writeFile(path.join(ROOT, `${id}.json`), JSON.stringify(data,null,2), "utf8");
  return data;
}

export async function readProject(id:string){
  return JSON.parse(await fs.readFile(path.join(ROOT, `${id}.json`), "utf8"));
}
