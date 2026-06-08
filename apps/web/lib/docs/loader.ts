import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import type {
  DocsHeading,
  DocsManifest,
  DocsNavItem,
  DocsNavSection,
  DocsPageData,
  DocsPageMeta,
  DocsSearchItem,
} from "./types";

const DOCS_PAGES_DIR = "pages";
const DOCS_NAV_FILE = "nav.json";
const MARKDOWN_EXTENSION = ".md";

type RawNavItem = {
  slug: string;
  title?: string;
  children: RawNavItem[];
};

type RawNavSection = {
  title: string;
  items: RawNavItem[];
};

type Frontmatter = {
  title?: string;
  description?: string;
  section?: string;
  order?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function slugValue(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function normalizeFrontmatter(value: unknown): Frontmatter {
  if (!isRecord(value)) return {};

  return {
    title: stringValue(value.title),
    description: stringValue(value.description),
    section: stringValue(value.section),
    order: numberValue(value.order),
  };
}

function resolveDocsRoot() {
  const fallback = path.resolve(process.cwd(), "..", "..", "docs");
  const candidates = [
    path.resolve(process.cwd(), "docs"),
    fallback,
  ];

  const existing = candidates.find((candidate) => existsSync(candidate));
  return existing ?? fallback;
}

async function readMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return readMarkdownFiles(absolutePath);
      }

      if (entry.isFile() && entry.name.endsWith(MARKDOWN_EXTENSION)) {
        return [absolutePath];
      }

      return [];
    }),
  );

  return nested.flat();
}

function filePathToSlug(filePath: string, pagesRoot: string) {
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

function hrefForSlug(slug: string) {
  return slug ? `/docs/${slug}` : "/docs";
}

function titleFromSlug(slug: string) {
  const lastSegment = slug.split("/").filter(Boolean).pop() ?? "docs";
  return lastSegment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stripInlineMarkdown(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~#>]/g, "")
    .trim();
}

function stripMarkdown(value: string) {
  return stripInlineMarkdown(
    value
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/^---[\s\S]*?---/m, " ")
      .replace(/^\s*[-*+]\s+/gm, " ")
      .replace(/^\s*\d+\.\s+/gm, " ")
      .replace(/\s+/g, " "),
  );
}

export function slugifyHeading(value: string) {
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
  const counts = new Map<string, number>();

  return (value: string) => {
    const base = slugifyHeading(value);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

function extractHeadingText(content: string, depth: 1 | 2 | 3) {
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

function extractHeadings(content: string): DocsHeading[] {
  const headings: DocsHeading[] = [];
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

    const depth = marker.length as 2 | 3;
    const title = stripInlineMarkdown(rawTitle);

    if (!title) continue;

    headings.push({
      id: nextId(title),
      title,
      depth,
    });
  }

  return headings;
}

function normalizeSearchText(parts: string[]) {
  return parts.join(" ").toLowerCase().replace(/\s+/g, " ").trim();
}

async function readDocsPage(filePath: string, pagesRoot: string) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const frontmatter = normalizeFrontmatter(parsed.data);
  const slug = filePathToSlug(filePath, pagesRoot);
  const h1 = extractHeadingText(parsed.content, 1);

  const title = frontmatter.title ?? h1 ?? titleFromSlug(slug);
  const description = frontmatter.description ?? "";
  const section = frontmatter.section ?? "Reference";
  const order = frontmatter.order ?? Number.MAX_SAFE_INTEGER;

  return {
    slug,
    href: hrefForSlug(slug),
    title,
    description,
    section,
    order,
    content: parsed.content,
    headings: extractHeadings(parsed.content),
  } satisfies DocsPageData;
}

function comparePages(a: DocsPageMeta, b: DocsPageMeta) {
  if (a.section !== b.section) {
    return a.section.localeCompare(b.section);
  }

  if (a.order !== b.order) {
    return a.order - b.order;
  }

  return a.title.localeCompare(b.title);
}

function pageToMeta(page: DocsPageData): DocsPageMeta {
  return {
    slug: page.slug,
    href: page.href,
    title: page.title,
    description: page.description,
    section: page.section,
    order: page.order,
  };
}

function normalizeRawNavItem(value: unknown): RawNavItem | null {
  if (!isRecord(value)) return null;

  const slug = slugValue(value.slug);
  if (slug === undefined) return null;

  const children = Array.isArray(value.children)
    ? value.children.map(normalizeRawNavItem).filter((item) => item !== null)
    : [];

  return {
    slug,
    title: stringValue(value.title),
    children,
  };
}

function normalizeRawNavSection(value: unknown): RawNavSection | null {
  if (!isRecord(value)) return null;

  const title = stringValue(value.title);
  const items = Array.isArray(value.items)
    ? value.items.map(normalizeRawNavItem).filter((item) => item !== null)
    : [];

  if (!title || items.length === 0) return null;

  return { title, items };
}

async function readRawNavSections(docsRoot: string) {
  const navPath = path.join(docsRoot, DOCS_NAV_FILE);
  const raw = await fs.readFile(navPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (!isRecord(parsed) || !Array.isArray(parsed.sections)) {
    throw new Error("docs/nav.json must contain a sections array.");
  }

  return parsed.sections
    .map(normalizeRawNavSection)
    .filter((section) => section !== null);
}

function buildNavItem(
  item: RawNavItem,
  pagesBySlug: Map<string, DocsPageData>,
  configuredSlugs: Set<string>,
): DocsNavItem {
  const page = pagesBySlug.get(item.slug);
  if (!page) {
    throw new Error(`docs/nav.json references missing docs page: ${item.slug}`);
  }

  configuredSlugs.add(page.slug);

  return {
    ...pageToMeta(page),
    title: item.title ?? page.title,
    children: item.children.map((child) =>
      buildNavItem(child, pagesBySlug, configuredSlugs),
    ),
  };
}

function buildNavSections(
  rawSections: RawNavSection[],
  pages: DocsPageData[],
  pagesBySlug: Map<string, DocsPageData>,
) {
  const configuredSlugs = new Set<string>();
  const navSections: DocsNavSection[] = rawSections.map((section) => ({
    title: section.title,
    items: section.items.map((item) =>
      buildNavItem(item, pagesBySlug, configuredSlugs),
    ),
  }));

  const unlistedPages = pages
    .filter((page) => !configuredSlugs.has(page.slug))
    .sort(comparePages);

  if (unlistedPages.length > 0) {
    navSections.push({
      title: "Other",
      items: unlistedPages.map((page) => ({
        ...pageToMeta(page),
        children: [],
      })),
    });
  }

  return navSections;
}

function buildSearchIndex(pages: DocsPageData[]): DocsSearchItem[] {
  return pages.flatMap((page) => {
    const pageItem: DocsSearchItem = {
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
      type: "heading" as const,
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

export const getDocsManifest = cache(async (): Promise<DocsManifest> => {
  const docsRoot = resolveDocsRoot();
  const pagesRoot = path.join(docsRoot, DOCS_PAGES_DIR);
  const filePaths = await readMarkdownFiles(pagesRoot);
  const pages = (await Promise.all(
    filePaths.map((filePath) => readDocsPage(filePath, pagesRoot)),
  )).sort(comparePages);

  const pagesBySlug = new Map<string, DocsPageData>();

  for (const page of pages) {
    if (pagesBySlug.has(page.slug)) {
      throw new Error(`Duplicate docs slug: ${page.slug}`);
    }

    pagesBySlug.set(page.slug, page);
  }

  const rawNavSections = await readRawNavSections(docsRoot);
  const navSections = buildNavSections(rawNavSections, pages, pagesBySlug);

  return {
    pages,
    pagesBySlug,
    navSections,
    searchIndex: buildSearchIndex(pages),
  };
});

export async function getDocsPage(slugSegments?: string[]) {
  const manifest = await getDocsManifest();
  const slug = (slugSegments ?? []).filter(Boolean).join("/");
  return manifest.pagesBySlug.get(slug) ?? null;
}

export async function getDocsStaticParams() {
  const manifest = await getDocsManifest();

  return manifest.pages.map((page) => ({
    slug: page.slug ? page.slug.split("/") : [],
  }));
}
