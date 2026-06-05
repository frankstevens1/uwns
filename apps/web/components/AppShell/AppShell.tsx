"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import AppHeader, {
  APP_HEADER_HEIGHT,
  SETTINGS_SECTION_HEADER_HEIGHT,
} from "./Header";

const BOTTOM_FADE_H = 18;

export function AppShell({
  title = "df",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const headerHeight = pathname?.startsWith("/app/settings")
    ? APP_HEADER_HEIGHT + SETTINGS_SECTION_HEADER_HEIGHT
    : APP_HEADER_HEIGHT;

  return (
    <div className="min-h-dvh bg-(--ui-bg) text-(--ui-fg) print:bg-white">
      <AppHeader title={title} headerHeight={headerHeight} />

      <div
        className="no-scrollbar relative overflow-y-auto print:!h-auto print:!overflow-visible print:!pt-0"
        style={{
          paddingTop: headerHeight,
          height: "100dvh",
        }}
      >
        {/* Top fade */}
        <div
          aria-hidden
          className="pointer-events-none fixed left-0 right-0 z-10 print:hidden"
          style={{
            top: headerHeight,
            height: 18,
            background:
              "linear-gradient(to bottom, var(--ui-fade-from), rgba(0,0,0,0))",
          }}
        />

        {/* Bottom fade */}
        <div
          aria-hidden
          className="pointer-events-none fixed left-0 right-0 z-10 print:hidden"
          style={{
            bottom: 0,
            height: BOTTOM_FADE_H,
            background:
              "linear-gradient(to top, var(--ui-fade-from), rgba(0,0,0,0))",
          }}
        />

        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
