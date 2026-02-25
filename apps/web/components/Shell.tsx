"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MarketingShell } from "./MarketingShell";
import { AppShell } from "./AppShell";

export function Shell({
  title = "df",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Treat /app as the authenticated product surface.
  const isApp = pathname?.startsWith("/app");

  return isApp ? (
    <AppShell title={title}>{children}</AppShell>
  ) : (
    <MarketingShell title={title}>{children}</MarketingShell>
  );
}
