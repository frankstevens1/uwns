import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function resolveUiRoot() {
  let dir = path.dirname(fileURLToPath(import.meta.url));

  for (let i = 0; i < 6; i++) {
    const hasSrc = fsSync.existsSync(path.join(dir, "src"));
    const hasPkgJson = fsSync.existsSync(path.join(dir, "package.json"));
    if (hasSrc && hasPkgJson) return dir;
    dir = path.dirname(dir);
  }

  return path.resolve(process.cwd(), "packages/ui");
}

const UI_ROOT = resolveUiRoot();
const SRC = path.join(UI_ROOT, "src");

async function listComponentFolders() {
  const buckets = ["components", "primitives"];
  const out = [];
  for (const bucket of buckets) {
    const p = path.join(SRC, bucket);
    try {
      const names = await fs.readdir(p);
      for (const name of names) {
        const dir = path.join(p, name);
        const st = await fs.stat(dir);
        if (!st.isDirectory()) continue;

        const hasComponentFiles =
          fsSync.existsSync(path.join(dir, `${name}.types.ts`)) ||
          fsSync.existsSync(path.join(dir, `${name}.web.tsx`)) ||
          fsSync.existsSync(path.join(dir, `${name}.native.tsx`));

        if (hasComponentFiles) out.push({ bucket, name, dir });
      }
    } catch {
      // ignore missing bucket
    }
  }
  return out;
}

async function readIndex(which) {
  const p = path.join(SRC, `index.${which}.ts`);
  const raw = await fs.readFile(p, "utf8");
  const exports = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("export {"));
  return { p, exports };
}

function extractExportedNames(lines) {
  // export { Card } from "./components/Card/Card.web";
  return new Set(
    lines.map((l) => {
      const m = l.match(/export\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from/);
      return m?.[1];
    }).filter(Boolean)
  );
}

async function main() {
  const folders = await listComponentFolders();

  // 1) Platform pair check
  const missing = [];
  for (const f of folders) {
    const web = path.join(f.dir, `${f.name}.web.tsx`);
    const native = path.join(f.dir, `${f.name}.native.tsx`);
    const types = path.join(f.dir, `${f.name}.types.ts`);

    const okWeb = await exists(web);
    const okNative = await exists(native);
    const okTypes = await exists(types);

    if (!okTypes) missing.push(`${f.bucket}/${f.name}: missing ${f.name}.types.ts`);
    if (!okWeb) missing.push(`${f.bucket}/${f.name}: missing ${f.name}.web.tsx`);
    if (!okNative) missing.push(`${f.bucket}/${f.name}: missing ${f.name}.native.tsx`);
  }

  // 2) Index sync check
  const iWeb = await readIndex("web");
  const iNative = await readIndex("native");
  const setWeb = extractExportedNames(iWeb.exports);
  const setNative = extractExportedNames(iNative.exports);

  const onlyWeb = [...setWeb].filter((x) => !setNative.has(x));
  const onlyNative = [...setNative].filter((x) => !setWeb.has(x));

  // 3) Case sensitivity check: ensure import path casing matches FS (basic)
  // (This is intentionally simple. It catches the common “Card vs card” folder mismatch.)
  const badCase = [];
  for (const f of folders) {
    if (f.name !== path.basename(f.dir)) badCase.push(`${f.bucket}/${f.name}: casing mismatch`);
  }

  const problems = [
    ...missing.map((m) => `- ${m}`),
    ...onlyWeb.map((n) => `- index.native.ts missing export for ${n}`),
    ...onlyNative.map((n) => `- index.web.ts missing export for ${n}`),
    ...badCase.map((b) => `- ${b}`)
  ];

  if (problems.length) {
    console.error("\n❌ @repo/ui checks failed:\n" + problems.join("\n") + "\n");
    process.exit(1);
  }

  console.log("✅ @repo/ui checks passed");
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
