export type DocsHeading = {
  id: string;
  title: string;
  depth: 2 | 3;
};

export type DocsPageMeta = {
  slug: string;
  href: string;
  title: string;
  description: string;
  section: string;
  order: number;
};

export type DocsPageData = DocsPageMeta & {
  content: string;
  headings: DocsHeading[];
};

export type DocsNavItem = DocsPageMeta & {
  children: DocsNavItem[];
};

export type DocsNavSection = {
  title: string;
  items: DocsNavItem[];
};

export type DocsSearchItem = {
  type: "page" | "heading";
  title: string;
  href: string;
  section: string;
  description: string;
  searchText: string;
};

export type DocsManifest = {
  pages: DocsPageData[];
  pagesBySlug: Map<string, DocsPageData>;
  navSections: DocsNavSection[];
  searchIndex: DocsSearchItem[];
};
