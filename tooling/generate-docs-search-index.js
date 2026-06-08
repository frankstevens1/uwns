#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DOCS_ROOT = path.join(ROOT, "docs");
const DOCS_PAGES_ROOT = path.join(DOCS_ROOT, "pages");
const OUTPUT_PATH = path.join(
  ROOT,
  "packages",
  "lib",
  "src",
  "docs-search-index.json",
);

const MARKDOWN_EXTENSION = ".md";

if (require.main === module) {
  main();
}

function main(argv = process.argv.slice(2)) {
  const verifyOnly = argv.includes("--check");
  const pages = readDocsPages(DOCS_PAGES_ROOT);
  const index = buildDocsSearchIndex(pages);
  const serialized = `${JSON.stringify(index, null, 2)}\n`;

  if (verifyOnly) {
    const current = fs.existsSync(OUTPUT_PATH)
      ? fs.readFileSync(OUTPUT_PATH, "utf8")
      : "";
    if (current !== serialized) {
      process.stderr.write(
        `docs search index is stale. Run ${path.relative(
          ROOT,
          __filename,
        )} to regenerate it.\n`,
      );
      process.exitCode = 1;
    }
    return serialized;
  }

  fs.writeFileSync(OUTPUT_PATH, serialized);
  return serialized;
}

function readDocsPages(pagesRoot) {
  return walkFiles(pagesRoot)
    .filter((filePath) => filePath.endsWith(MARKDOWN_EXTENSION))
    .map((filePath) => readDocsPage(filePath, pagesRoot))
    .sort(comparePages);
}

function walkFiles(root) {
  const stack = [root];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;

    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function readDocsPage(filePath, pagesRoot) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = parseMarkdown(raw);
  const slug = filePathToSlug(filePath, pagesRoot);
  const h1 = extractHeadingText(parsed.content, 1);

  return {
    slug,
    href: hrefForSlug(slug),
    title: parsed.frontmatter.title ?? h1 ?? titleFromSlug(slug),
    description: parsed.frontmatter.description ?? "",
    section: parsed.frontmatter.section ?? "Reference",
    order: parsed.frontmatter.order ?? Number.MAX_SAFE_INTEGER,
    content: parsed.content,
    headings: extractHeadings(parsed.content),
  };
}

function parseMarkdown(raw) {
  if (!raw.startsWith("---\n")) {
    return {
      frontmatter: {},
      content: raw,
    };
  }

  const closingIndex = raw.indexOf("\n---", 4);
  if (closingIndex === -1) {
    return {
      frontmatter: {},
      content: raw,
    };
  }

  const frontmatterRaw = raw.slice(4, closingIndex);
  const contentStart = raw.indexOf("\n", closingIndex + 4);
  const content = contentStart === -1 ? "" : raw.slice(contentStart + 1);

  return {
    frontmatter: parseFrontmatter(frontmatterRaw),
    content,
  };
}

function parseFrontmatter(raw) {
  const parsed = {};

  for (const line of raw.split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim());
    if (!match) continue;

    const key = match[1];
    const value = normalizeFrontmatterValue(match[2] ?? "");
    if (key === "order") {
      const order = Number(value);
      if (Number.isFinite(order)) parsed.order = order;
      continue;
    }

    if (value) parsed[key] = value;
  }

  return parsed;
}

function normalizeFrontmatterValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function filePathToSlug(filePath, pagesRoot) {
  const relativePath = path
    .relative(pagesRoot, filePath)
    .split(path.sep)
    .join("/");
  const withoutExtension = relativePath.slice(0, -MARKDOWN_EXTENSION.length);
  const segments = withoutExtension.split("/").filter(Boolean);

  if (segments[segments.length - 1] === "index") {
    segments.pop();
  }

  return segments.join("/");
}

function hrefForSlug(slug) {
  return slug ? `/docs/${slug}` : "/docs";
}

function titleFromSlug(slug) {
  const lastSegment = slug.split("/").filter(Boolean).pop() ?? "docs";
  return lastSegment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stripInlineMarkdown(value) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~#>]/g, "")
    .trim();
}

function stripMarkdown(value) {
  return stripInlineMarkdown(
    value
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/^---[\s\S]*?---/m, " ")
      .replace(/^\s*[-*+]\s+/gm, " ")
      .replace(/^\s*\d+\.\s+/gm, " ")
      .replace(/\s+/g, " "),
  );
}

function slugifyHeading(value) {
  const base = stripInlineMarkdown(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return base || "section";
}

function createUniqueSlugger() {
  const counts = new Map();

  return (value) => {
    const base = slugifyHeading(value);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

function extractHeadingText(content, depth) {
  let inFence = false;
  const marker = "#".repeat(depth);

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }

    if (inFence || !trimmed.startsWith(`${marker} `)) continue;

    return stripInlineMarkdown(trimmed.slice(depth).trim());
  }

  return undefined;
}

function extractHeadings(content) {
  const headings = [];
  const nextId = createUniqueSlugger();
  let inFence = false;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(trimmed);
    if (!match) continue;

    const marker = match[1];
    const rawTitle = match[2];
    if (!marker || !rawTitle) continue;

    const title = stripInlineMarkdown(rawTitle);
    if (!title) continue;

    headings.push({
      id: nextId(title),
      title,
      depth: marker.length,
    });
  }

  return headings;
}

function normalizeSearchText(parts) {
  return parts.join(" ").toLowerCase().replace(/\s+/g, " ").trim();
}

function comparePages(a, b) {
  if (a.section !== b.section) {
    return a.section.localeCompare(b.section);
  }

  if (a.order !== b.order) {
    return a.order - b.order;
  }

  return a.title.localeCompare(b.title);
}

function buildDocsSearchIndex(pages) {
  return pages.flatMap((page) => {
    const pageItem = {
      type: "page",
      title: page.title,
      href: page.href,
      section: page.section,
      description: page.description,
      searchText: normalizeSearchText([
        page.title,
        page.description,
        page.section,
        stripMarkdown(page.content),
      ]),
    };

    const headingItems = page.headings.map((heading) => ({
      type: "heading",
      title: heading.title,
      href: `${page.href}#${heading.id}`,
      section: page.title,
      description: page.description,
      searchText: normalizeSearchText([
        page.title,
        heading.title,
        page.description,
      ]),
    }));

    return [pageItem, ...headingItems];
  });
}

module.exports = {
  ROOT,
  DOCS_PAGES_ROOT,
  OUTPUT_PATH,
  MARKDOWN_EXTENSION,
  main,
  readDocsPages,
  walkFiles,
  readDocsPage,
  parseMarkdown,
  parseFrontmatter,
  filePathToSlug,
  hrefForSlug,
  titleFromSlug,
  stripInlineMarkdown,
  stripMarkdown,
  slugifyHeading,
  extractHeadings,
  normalizeSearchText,
  buildDocsSearchIndex,
};
