#!/usr/bin/env node
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function resolveUiRoot() {
  // Prefer resolving relative to this script (stable no matter where you run it from)
  let dir = path.dirname(fileURLToPath(import.meta.url));

  // Walk up a few levels to find the ui package root (has src/ and templates/)
  for (let i = 0; i < 6; i++) {
    const hasSrc = fsSync.existsSync(path.join(dir, "src"));
    const hasTemplates = fsSync.existsSync(path.join(dir, "templates"));
    const hasPkgJson = fsSync.existsSync(path.join(dir, "package.json"));
    if (hasSrc && hasTemplates && hasPkgJson) return dir;
    dir = path.dirname(dir);
  }

  // Fallback (repo root execution)
  return path.resolve(process.cwd(), "packages/ui");
}

const UI_ROOT = resolveUiRoot();
const SRC_ROOT = path.join(UI_ROOT, "src");

const args = process.argv.slice(2);

function parseArgs(argv) {
  const out = { name: null, docs: false, variant: "component", theme: false }; // component|primitive|composite
  for (const a of argv) {
    if (!out.name && !a.startsWith("--")) out.name = a;
    else if (a === "--docs") out.docs = true;

    // theme stub
    else if (a === "--theme" || a === "--with-theme") out.theme = true;

    // ergonomic flags
    else if (a === "--primitive") out.variant = "primitive";
    else if (a === "--component") out.variant = "component";
    else if (a === "--composite") out.variant = "composite";

    // explicit
    else if (a.startsWith("--variant=")) out.variant = a.split("=")[1];
  }
  return out;
}

function assertVariant(variant) {
  const allowed = new Set(["component", "primitive", "composite"]);
  if (!allowed.has(variant)) {
    throw new Error(
      `Invalid --variant="${variant}". Use component|primitive|composite (or --primitive / --component / --composite).`
    );
  }
}

function assertComponentName(name) {
  if (!name) throw new Error("Missing component name. Example: pnpm ui:gen Card");
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(`Invalid name "${name}". Use PascalCase (e.g. Card, DatePicker2).`);
  }
}

function bucketForVariant(variant) {
  // treat composite as components
  if (variant === "primitive") return "primitives";
  return "components";
}

function componentDir(variant, name) {
  const bucket = bucketForVariant(variant);
  return path.join(SRC_ROOT, bucket, name);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readTpl(rel) {
  // ✅ fixed: now stable because UI_ROOT is stable
  const p = path.join(UI_ROOT, "templates", "component", rel);
  return fs.readFile(p, "utf8");
}

function applyTpl(tpl, vars) {
  return tpl.replaceAll("{{ComponentName}}", vars.ComponentName);
}

function normalizeLine(line) {
  return line.trim().replace(/\s+/g, " ");
}

async function ensureFile(p, initial = "") {
  if (!(await exists(p))) {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, initial, "utf8");
  }
}

async function upsertIndex({ indexPath, exportStmt }) {
  await ensureFile(indexPath, "");

  const raw = await fs.readFile(indexPath, "utf8");
  const lines = raw.split("\n");

  const normTarget = normalizeLine(exportStmt);
  if (lines.some((l) => normalizeLine(l) === normTarget)) return;

  const exportLines = lines.filter((l) => l.trim().startsWith("export "));
  const otherLines = lines.filter((l) => !l.trim().startsWith("export "));

  exportLines.push(exportStmt);
  exportLines.sort((a, b) => a.localeCompare(b));

  const rebuilt = [...otherLines.filter((l) => l.trim() !== ""), ...exportLines, ""].join("\n");
  await fs.writeFile(indexPath, rebuilt, "utf8");
}

// -------- Theme stub generation (generic, minimal) --------

function lowerFirst(s) {
  return s.length ? s[0].toLowerCase() + s.slice(1) : s;
}

function recipeSpecFor(name) {
  const base = lowerFirst(name); // Card -> card
  const exportName = `${base}Tokens`; // cardTokens
  const recipesDir = path.join(SRC_ROOT, "theme", "recipes");
  const recipePath = path.join(recipesDir, `${base}.ts`);

  const content = `import { useThemeTokens } from "../../theme";

/**
 * ${name} recipe tokens.
 * Extend deliberately: add size / variant / state only when needed.
 */
export const ${exportName} = {
  base: {
    // radius: tokens.radius.md,
    // padding: tokens.space[3],
  },

  // size: {},
  // variant: {},
  // state: {},
} as const;
`;

  return { base, exportName, recipePath, content };
}

async function ensureThemeStub(name) {
  const { base, exportName, recipePath, content } = recipeSpecFor(name);

  // Create recipe file if missing
  await ensureFile(recipePath, content);

  // Ensure theme/index.ts exports it
  const themeIndex = path.join(SRC_ROOT, "theme", "index.ts");

  // If theme/index.ts doesn't exist yet, create a minimal stable public entry.
  // This assumes you will later flesh out your theme layout, but keeps generator functional.
  const minimalThemeIndex = `export { tokens } from "./tokens";
export type { Tokens } from "./tokens";
`;

  await ensureFile(themeIndex, minimalThemeIndex);

  await upsertIndex({
    indexPath: themeIndex,
    exportStmt: `export { ${exportName} } from "./recipes/${base}";`,
  });

  // Optional: if recipes/index.ts exists, keep it synced too (doesn't create it)
  const recipesIndex = path.join(SRC_ROOT, "theme", "recipes", "index.ts");
  if (await exists(recipesIndex)) {
    await upsertIndex({
      indexPath: recipesIndex,
      exportStmt: `export { ${exportName} } from "./${base}";`,
    });
  }

  return { base, exportName, recipePath };
}

async function main() {
  const opts = parseArgs(args);
  assertVariant(opts.variant);
  assertComponentName(opts.name);

  const name = opts.name;
  const dir = componentDir(opts.variant, name);

  if (await exists(dir)) {
    throw new Error(`Component folder already exists: ${path.relative(UI_ROOT, dir)}`);
  }

  await fs.mkdir(dir, { recursive: true });

  const vars = { ComponentName: name };

  const typesTpl = await readTpl("Component.types.ts.tpl");
  const webTpl = await readTpl("Component.web.tsx.tpl");
  const nativeTpl = await readTpl("Component.native.tsx.tpl");

  await fs.writeFile(path.join(dir, `${name}.types.ts`), applyTpl(typesTpl, vars));
  await fs.writeFile(path.join(dir, `${name}.web.tsx`), applyTpl(webTpl, vars));
  await fs.writeFile(path.join(dir, `${name}.native.tsx`), applyTpl(nativeTpl, vars));

  if (opts.docs) {
    const mdxTpl = await readTpl("Component.mdx.tpl");
    await fs.writeFile(path.join(dir, `${name}.mdx`), applyTpl(mdxTpl, vars));
  }

  const bucket = bucketForVariant(opts.variant);
  const relBase = `./${bucket}/${name}/${name}`;

  await upsertIndex({
    indexPath: path.join(SRC_ROOT, "index.web.ts"),
    exportStmt: `export { ${name} } from "${relBase}.web";`,
  });

  await upsertIndex({
    indexPath: path.join(SRC_ROOT, "index.native.ts"),
    exportStmt: `export { ${name} } from "${relBase}.native";`,
  });

  if (opts.theme) {
    await ensureThemeStub(name);
  }

  console.log(`✅ Created ${name} (${bucket})${opts.docs ? " + docs" : ""}${opts.theme ? " + theme" : ""}`);
}

main().catch((e) => {
  console.error(`\n❌ ${e.message}\n`);
  process.exit(1);
});
