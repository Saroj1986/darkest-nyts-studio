import fs from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

const ROOT = path.join(process.cwd(), "projects");
const useBlob = Boolean(process.env.BLOB_STORE_ID);

export async function saveProject(idOrData: string | any, maybeData?: any) {
  const data = maybeData ?? idOrData;
  const id = maybeData ? idOrData : data.id;
  const filename = `projects/${id}.json`;
  const content = JSON.stringify(data, null, 2);

  if (useBlob) {
    await put(filename, content, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return data;
  }

  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(
    path.join(ROOT, `${data.id}.json`),
    content,
    "utf8"
  );

  return data;
}

export async function readProject(id: string) {
  const filename = `projects/${id}.json`;

  if (useBlob) {
    const result = await get(filename, {
      access: "private",
      useCache: false,
    });

    if (!result) {
      throw new Error(`Project not found: ${id}`);
    }

    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  }

  return JSON.parse(
    await fs.readFile(path.join(ROOT, `${id}.json`), "utf8")
  );
}
