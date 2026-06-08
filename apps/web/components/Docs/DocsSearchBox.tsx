"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, ListTree, Search } from "lucide-react";
import {
  setDocsHeaderState,
  useDocsHeaderState,
} from "@/components/Docs/docsHeaderStore";
import type { DocsSearchItem } from "@/lib/docs/types";

const SEARCH_RESULT_LIMIT = 12;

type DocsSearchBoxProps = {
  searchIndex: DocsSearchItem[];
  className?: string;
  inputClassName?: string;
  sharedQuery?: boolean;
};

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function SearchResults({
  query,
  results,
  onNavigate,
}: {
  query: string;
  results: DocsSearchItem[];
  onNavigate: () => void;
}) {
  if (!query.trim()) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-lg border border-(--ui-border) bg-(--ui-bg) shadow-xl">
      {results.length > 0 ? (
        <div className="max-h-80 overflow-y-auto p-1">
          {results.map((result) => (
            <Link
              key={`${result.type}:${result.href}`}
              href={result.href}
              onClick={onNavigate}
              className="block rounded-md px-3 py-2 hover:bg-(--ui-subtle-bg)"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-(--ui-fg)">
                {result.type === "page" ? (
                  <BookOpen size={14} />
                ) : (
                  <ListTree size={14} />
                )}
                <span className="truncate">{result.title}</span>
              </div>
              <div className="mt-0.5 truncate text-xs text-(--ui-muted-fg)">
                {result.section}
                {result.description ? ` - ${result.description}` : ""}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="px-3 py-5 text-center text-sm text-(--ui-muted-fg)">
          No docs results.
        </div>
      )}
    </div>
  );
}

export function DocsSearchBox({
  searchIndex,
  className = "",
  inputClassName = "h-9",
  sharedQuery = false,
}: DocsSearchBoxProps) {
  const docsHeader = useDocsHeaderState();
  const [localQuery, setLocalQuery] = React.useState("");
  const query = sharedQuery ? docsHeader.query : localQuery;
  const normalizedQuery = normalizeQuery(query);

  const searchResults = React.useMemo(() => {
    if (!normalizedQuery) return [];

    return searchIndex
      .filter((item) => item.searchText.includes(normalizedQuery))
      .slice(0, SEARCH_RESULT_LIMIT);
  }, [normalizedQuery, searchIndex]);

  const setQuery = React.useCallback(
    (nextQuery: string) => {
      if (sharedQuery) {
        setDocsHeaderState({ query: nextQuery });
        return;
      }

      setLocalQuery(nextQuery);
    },
    [sharedQuery],
  );

  const clearSearch = React.useCallback(() => setQuery(""), [setQuery]);

  return (
    <div className={["relative min-w-0", className].filter(Boolean).join(" ")}>
      <Search
        aria-hidden
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--ui-muted-fg)"
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search docs"
        aria-label="Search docs"
        className={[
          "w-full rounded-md border border-(--ui-border) bg-(--ui-bg) py-2 pl-9 pr-3 text-sm text-(--ui-fg) outline-none placeholder:text-(--ui-muted-fg) focus:ring-2 focus:ring-(--ui-ring)",
          inputClassName,
        ].join(" ")}
      />
      <SearchResults
        query={query}
        results={searchResults}
        onNavigate={clearSearch}
      />
    </div>
  );
}
