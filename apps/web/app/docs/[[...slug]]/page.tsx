import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDocsManifest,
  getDocsPage,
  getDocsStaticParams,
} from "@/lib/docs/loader";
import { DocsMarkdown } from "./DocsMarkdown";
import { DocsShell } from "./DocsShell";

type DocsPageProps = {
  params: Promise<{ slug?: string[] }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getDocsStaticParams();
}

export async function generateMetadata({
  params,
}: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getDocsPage(slug);

  if (!page) {
    return {
      title: "Docs",
    };
  }

  return {
    title: `${page.title} | UWNS Docs`,
    description: page.description,
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const [manifest, page] = await Promise.all([
    getDocsManifest(),
    getDocsPage(slug),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <DocsShell
      page={{
        slug: page.slug,
        href: page.href,
        title: page.title,
        description: page.description,
        section: page.section,
        headings: page.headings,
      }}
      navSections={manifest.navSections}
      searchIndex={manifest.searchIndex}
    >
      <DocsMarkdown content={page.content} />
    </DocsShell>
  );
}
