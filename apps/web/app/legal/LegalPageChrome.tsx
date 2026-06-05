"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui";
import type { LegalDocument } from "./legalContent";
import { legalDocumentOrder } from "./legalContent";
import { LegalPdfButton } from "./LegalPdfButton";

type LegalPageChromeProps = {
  document: LegalDocument;
};

export function LegalPageChrome({ document }: LegalPageChromeProps) {
  const router = useRouter();

  const selectDocument = React.useCallback(
    (nextDocument: string) => {
      if (nextDocument !== "privacy" && nextDocument !== "terms") return;
      router.push(`/legal?document=${nextDocument}`);
    },
    [router],
  );

  return (
    <header className="space-y-4 print:hidden">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-(--ui-muted-fg)">
          Legal
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Legal documents
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-(--ui-muted-fg)">
          Review the current privacy policy or terms. The switcher updates the
          URL so each document can be bookmarked and shared directly.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-y border-(--ui-border) py-3 sm:flex-row sm:items-center sm:justify-between">
        <ToggleGroup
          value={document.slug}
          onValueChange={selectDocument}
          ariaLabel="Legal documents"
        >
          {legalDocumentOrder.map((slug) => (
            <ToggleGroupItem key={slug} value={slug}>
              {slug === "privacy" ? "Privacy Policy" : "Terms of Service"}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <LegalPdfButton title={document.title} />
      </div>
    </header>
  );
}
