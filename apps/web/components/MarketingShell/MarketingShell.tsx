"use client";

import * as React from "react";
import MarketingHeader from "./Header";
import MarketingFooter from "./Footer";

const HEADER_H = 56;
const FOOTER_H = 64;

export function MarketingShell({
  title = "df",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-(--ui-bg) text-(--ui-fg)">
      <MarketingHeader title={title} headerHeight={HEADER_H} />

      <div
        className="no-scrollbar relative overflow-y-auto"
        style={{
          paddingTop: HEADER_H,
          paddingBottom: FOOTER_H,
          height: "100dvh",
        }}
      >
        {/* Top fade */}
        <div
          aria-hidden
          className="pointer-events-none fixed left-0 right-0 z-10"
          style={{
            top: HEADER_H,
            height: 18,
            background:
              "linear-gradient(to bottom, var(--ui-fade-from), rgba(0,0,0,0))",
          }}
        />

        {/* Bottom fade */}
        <div
          aria-hidden
          className="pointer-events-none fixed left-0 right-0 z-10"
          style={{
            bottom: FOOTER_H,
            height: 18,
            background:
              "linear-gradient(to top, var(--ui-fade-from), rgba(0,0,0,0))",
          }}
        />

        <main className="mx-auto max-w-5xl px-4 py-10">
          {children}
        </main>
      </div>

      <MarketingFooter footerHeight={FOOTER_H} />
    </div>
  );
}
