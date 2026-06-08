import docsSearchIndexJson from "./docs-search-index.json";

export type DocsSearchItem = {
  type: "page" | "heading";
  title: string;
  href: string;
  section: string;
  description: string;
  searchText: string;
};

export const docsSearchIndex = docsSearchIndexJson as DocsSearchItem[];

export function searchDocs(query: string, limit?: number): DocsSearchItem[] {
  const normalizedQuery = normalizeDocsQuery(query);
  const resolvedLimit = normalizeSearchLimit(limit);

  if (!normalizedQuery) {
    return docsSearchIndex.slice(0, resolvedLimit);
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return docsSearchIndex
    .filter((item) => docsItemMatchesTerms(item, terms))
    .map((item) => ({
      item,
      score: scoreDocsSearchItem(item, normalizedQuery),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.item.title.localeCompare(b.item.title) ||
        a.item.href.localeCompare(b.item.href),
    )
    .slice(0, resolvedLimit)
    .map(({ item }) => item);
}

export function resolveDocsUrl(href: string, baseUrl: string) {
  const normalizedBaseUrl = baseUrl.trim();
  if (!normalizedBaseUrl) return null;

  try {
    const normalizedHref = href.startsWith("/") ? href : `/${href}`;
    return new URL(normalizedHref, normalizedBaseUrl).toString();
  } catch {
    return null;
  }
}

function normalizeDocsQuery(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeSearchLimit(limit: number | undefined) {
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit <= 0) {
    return docsSearchIndex.length;
  }

  return Math.floor(limit);
}

function docsItemMatchesTerms(item: DocsSearchItem, terms: string[]) {
  const searchable = [item.title, item.href, item.section, item.searchText]
    .join(" ")
    .toLowerCase();

  return terms.every((term) => searchable.includes(term));
}

function scoreDocsSearchItem(item: DocsSearchItem, normalizedQuery: string) {
  const title = item.title.toLowerCase();
  const section = item.section.toLowerCase();
  const description = item.description.toLowerCase();
  let score = item.type === "page" ? 5 : 0;

  if (title === normalizedQuery) score += 100;
  if (title.startsWith(normalizedQuery)) score += 60;
  if (title.includes(normalizedQuery)) score += 40;
  if (section.includes(normalizedQuery)) score += 20;
  if (description.includes(normalizedQuery)) score += 15;
  if (item.searchText.includes(normalizedQuery)) score += 10;

  return score;
}
