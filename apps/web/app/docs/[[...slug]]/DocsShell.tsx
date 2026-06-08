"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useActions, useAuth } from "@repo/providers";
import { DocsSearchBox } from "@/components/Docs/DocsSearchBox";
import { setDocsHeaderState } from "@/components/Docs/docsHeaderStore";
import type {
  DocsHeading,
  DocsNavItem,
  DocsNavSection,
  DocsSearchItem,
} from "@/lib/docs/types";

type DocsShellPage = {
  slug: string;
  href: string;
  title: string;
  description: string;
  section: string;
  headings: DocsHeading[];
};

type DocsShellProps = {
  page: DocsShellPage;
  navSections: DocsNavSection[];
  searchIndex: DocsSearchItem[];
  children: React.ReactNode;
};

const MARKETING_HEADER_HEIGHT = 56;
const ACTIVE_HEADING_OFFSET = MARKETING_HEADER_HEIGHT + 12;
const DOCKED_HEADER_LEAD = 36;

function itemIsActive(item: DocsNavItem, pathname: string) {
  if (item.href === "/docs") return pathname === "/docs";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function DocsNavList({
  sections,
  pathname,
  onNavigate,
}: {
  sections: DocsNavSection[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Documentation" className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <div className="text-xs font-medium uppercase text-(--ui-muted-fg)">
            {section.title}
          </div>
          <div className="space-y-1">
            {section.items.map((item) => (
              <DocsNavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function DocsNavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: DocsNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = itemIsActive(item, pathname);

  return (
    <div className="space-y-1">
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={[
          "block rounded-md px-2 py-1.5 text-sm",
          active
            ? "bg-(--ui-subtle-bg) font-medium text-(--ui-fg)"
            : "text-(--ui-muted-fg) hover:bg-(--ui-subtle-bg) hover:text-(--ui-fg)",
        ].join(" ")}
      >
        {item.title}
      </Link>

      {item.children.length > 0 ? (
        <div className="ml-3 border-l border-(--ui-border) pl-3">
          {item.children.map((child) => (
            <DocsNavLink
              key={child.href}
              item={child}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OnThisPage({
  headings,
  activeHeadingId,
}: {
  headings: DocsHeading[];
  activeHeadingId: string | null;
}) {
  if (headings.length === 0) {
    return (
      <div className="text-sm text-(--ui-muted-fg)">
        No sections on this page.
      </div>
    );
  }

  return (
    <nav aria-label="On this page" className="space-y-2">
      {headings.map((heading) => {
        const active = heading.id === activeHeadingId;

        return (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            aria-current={active ? "location" : undefined}
            className={[
              "block border-l px-3 py-1 text-sm",
              heading.depth === 3 ? "ml-3" : "",
              active
                ? "border-(--ui-fg) font-medium text-(--ui-fg)"
                : "border-(--ui-border) text-(--ui-muted-fg) hover:border-(--ui-fg) hover:text-(--ui-fg)",
            ].join(" ")}
          >
            {heading.title}
          </a>
        );
      })}
    </nav>
  );
}

function DocsViewedTracker() {
  const { user, loading } = useAuth();
  const { trackAction } = useActions();
  const trackedUserIdsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (loading || !user || trackedUserIdsRef.current.has(user.id)) return;

    trackedUserIdsRef.current.add(user.id);
    void trackAction({
      actionName: "docs_viewed",
      uniqueKey: "web:docs_viewed",
      metadata: {
        source: "docs_route",
        screen: "docs",
      },
    });
  }, [loading, trackAction, user]);

  return null;
}

export function DocsShell({
  page,
  navSections,
  searchIndex,
  children,
}: DocsShellProps) {
  const pathname = usePathname() ?? page.href;
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [activeHeadingId, setActiveHeadingId] = React.useState<string | null>(
    page.headings[0]?.id ?? null,
  );
  const headerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    setActiveHeadingId(page.headings[0]?.id ?? null);
  }, [page.slug, page.headings]);

  React.useEffect(() => {
    setDocsHeaderState({
      active: true,
      title: page.title,
      href: page.href,
      searchIndex,
    });
  }, [page.href, page.title, searchIndex]);

  React.useEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    const scrollRoot = headerElement.closest(".no-scrollbar");
    const scrollTarget =
      scrollRoot instanceof HTMLElement ? scrollRoot : window;
    let rafId = 0;

    const updateDocked = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = 0;

        const rootTop =
          scrollRoot instanceof HTMLElement
            ? scrollRoot.getBoundingClientRect().top
            : 0;
        const docked =
          headerElement.getBoundingClientRect().bottom <=
          rootTop + MARKETING_HEADER_HEIGHT + DOCKED_HEADER_LEAD;

        setDocsHeaderState({ docked });
      });
    };

    updateDocked();
    scrollTarget.addEventListener("scroll", updateDocked, { passive: true });
    window.addEventListener("resize", updateDocked);

    return () => {
      scrollTarget.removeEventListener("scroll", updateDocked);
      window.removeEventListener("resize", updateDocked);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [page.slug]);

  React.useEffect(() => {
    if (page.headings.length === 0) return;

    const headingElements = page.headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headingElements.length === 0) return;

    const scrollRoot = headingElements[0]?.closest(".no-scrollbar");
    const scrollTarget =
      scrollRoot instanceof HTMLElement ? scrollRoot : window;

    let rafId = 0;

    const updateActiveHeading = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = 0;

        const isAtBottom =
          scrollRoot instanceof HTMLElement &&
          scrollRoot.scrollHeight -
            scrollRoot.scrollTop -
            scrollRoot.clientHeight <
            2;

        if (isAtBottom) {
          setActiveHeadingId(
            page.headings[page.headings.length - 1]?.id ?? null,
          );
          return;
        }

        const activationTop =
          (scrollRoot instanceof HTMLElement
            ? scrollRoot.getBoundingClientRect().top
            : 0) + ACTIVE_HEADING_OFFSET;
        let nextActiveId = headingElements[0]?.id ?? null;

        for (const element of headingElements) {
          if (element.getBoundingClientRect().top <= activationTop) {
            nextActiveId = element.id;
          } else {
            break;
          }
        }

        setActiveHeadingId(nextActiveId);
      });
    };

    updateActiveHeading();
    scrollTarget.addEventListener("scroll", updateActiveHeading, {
      passive: true,
    });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      scrollTarget.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [page.slug, page.headings]);

  return (
    <section className="space-y-6">
      <DocsViewedTracker />

      <header
        ref={headerRef}
        className="space-y-4 border-b border-(--ui-border) pb-4"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="text-xs font-medium uppercase text-(--ui-muted-fg)">
              Documentation
            </div>
            <h1 className="truncate text-2xl font-semibold">{page.title}</h1>
          </div>

          <div className="flex min-w-0 gap-2 md:w-[360px]">
            <DocsSearchBox
              searchIndex={searchIndex}
              className="flex-1"
              sharedQuery
            />

            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-(--ui-border) px-3 text-sm font-medium text-(--ui-fg) hover:bg-(--ui-subtle-bg) lg:hidden"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X size={16} /> : <Menu size={16} />}
              Docs
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="rounded-lg border border-(--ui-border) p-3 lg:hidden">
            <DocsNavList
              sections={navSections}
              pathname={pathname}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        ) : null}

        {page.headings.length > 0 ? (
          <div className="space-y-2 lg:hidden">
            <div className="text-xs font-medium uppercase text-(--ui-muted-fg)">
              On this page
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {page.headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  aria-current={
                    heading.id === activeHeadingId ? "location" : undefined
                  }
                  className={[
                    "shrink-0 rounded-md border px-3 py-1.5 text-sm",
                    heading.id === activeHeadingId
                      ? "border-(--ui-fg) text-(--ui-fg)"
                      : "border-(--ui-border) text-(--ui-muted-fg)",
                  ].join(" ")}
                >
                  {heading.title}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)_170px]">
        <aside className="hidden lg:block">
          <div className="sticky top-14 max-h-[calc(100dvh-120px)] overflow-y-auto pr-2">
            <DocsNavList sections={navSections} pathname={pathname} />
          </div>
        </aside>

        <article className="min-w-0 pb-8">{children}</article>

        <aside className="hidden lg:block">
          <div className="sticky top-14 max-h-[calc(100dvh-120px)] overflow-y-auto">
            <div className="mb-3 text-xs font-medium uppercase text-(--ui-muted-fg)">
              On this page
            </div>
            <OnThisPage
              headings={page.headings}
              activeHeadingId={activeHeadingId}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
