import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (["node_modules", ".next", ".git"].includes(name)) continue;
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walk(filePath);
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(name)) {
      files.push(filePath);
    }
  }
}

walk(root);

let errors = 0;

// Correct JavaScript regex: single escaping is required inside a regex literal.
const importRegex = /from\s+["'](\.\.?\/[^"']+)["']/g;

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  let match;

  while ((match = importRegex.exec(text)) !== null) {
    const specifier = match[1];
    const base = path.resolve(path.dirname(file), specifier);

    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.js`,
      `${base}.mjs`,
      path.join(base, "index.ts"),
      path.join(base, "index.tsx")
    ];

    if (!candidates.some(candidate => fs.existsSync(candidate))) {
      console.error(
        `BROKEN IMPORT: ${path.relative(root, file)} -> ${specifier}`
      );
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\nFound ${errors} broken relative import(s).`);
  process.exit(1);
}

console.log("Import check passed.");
