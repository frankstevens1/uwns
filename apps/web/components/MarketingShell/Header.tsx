"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@repo/ui";
import { useAuth } from "@repo/providers";
import { DocsSearchBox } from "@/components/Docs/DocsSearchBox";
import { useDocsHeaderState } from "@/components/Docs/docsHeaderStore";
import { UserMenu } from "@/components/UserMenu";
import { LogoUwns } from "../LogoSvg";

const HEADER_H = 56;

export default function MarketingHeader({
  title,
  headerHeight,
}: {
  title: string;
  headerHeight?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const docsHeader = useDocsHeaderState();

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isAuthRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/update-password") ||
    pathname?.startsWith("/check-email");

  const go = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  const isDocsRoute = !!pathname?.startsWith("/docs");
  const showDocsHeader = isDocsRoute && docsHeader.active && docsHeader.docked;

  return (
    <header
      aria-label={`${title} marketing header`}
      className={[
        "fixed left-0 right-0 top-0 z-30",
        "bg-(--ui-panel)/80 supports-backdrop-filter:backdrop-blur",
        "transition-colors",
        "print:hidden",
      ].join(" ")}
      style={{ height: headerHeight || HEADER_H }}
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <LogoUwns className="h-6 w-auto text-foreground" version={"1"} />
          </Link>

          {showDocsHeader ? (
            <div className="hidden min-w-0 items-center gap-2 border-l border-(--ui-border) pl-3 sm:flex">
              <Link
                href="/docs"
                className="shrink-0 text-xs font-medium uppercase text-(--ui-muted-fg) hover:text-(--ui-fg)"
              >
                Docs
              </Link>
              <span aria-hidden className="text-xs text-(--ui-muted-fg)">
                /
              </span>
              <Link
                href={docsHeader.href}
                className="truncate text-sm font-medium text-(--ui-fg)"
              >
                {docsHeader.title}
              </Link>
            </div>
          ) : null}
        </div>

        {/* Desktop: quiet utilities + one CTA */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {showDocsHeader ? (
            <DocsSearchBox
              searchIndex={docsHeader.searchIndex}
              className="hidden w-72 md:block"
              inputClassName="h-8"
              sharedQuery
            />
          ) : null}

          {!isDocsRoute ? (
            <Link
              href="/docs"
              className="rounded-md px-3 py-2 text-sm font-medium text-(--ui-muted-fg) hover:bg-(--ui-subtle-bg) hover:text-(--ui-fg)"
            >
              Docs
            </Link>
          ) : null}

          {!loading && !isAuthRoute && user ? (
            <UserMenu signOutSource="marketing_header" />
          ) : null}

          {!loading && !isAuthRoute && !user ? (
            <Button variant="primary" onPress={() => go("/login")}>
              Demo
            </Button>
          ) : null}
        </div>

        {/* Mobile: keep menu variant */}
        <div className="flex items-center gap-2 sm:hidden">
          <Button
            variant="ghost"
            onPress={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="bg-(--ui-panel) supports-backdrop-filter:backdrop-blur border-b">
          <div className="mx-auto max-w-5xl px-4 pb-3 pt-2">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" onPress={() => go("/")}>
                Home
              </Button>

              {!isDocsRoute ? (
                <Button variant="ghost" onPress={() => go("/docs")}>
                  Docs
                </Button>
              ) : null}

              <Button
                variant="ghost"
                onPress={() => go("/legal?document=privacy")}
              >
                Privacy Policy
              </Button>

              <Button
                variant="ghost"
                onPress={() => go("/legal?document=terms")}
              >
                Terms of Service
              </Button>

              {/* Keep this minimal. Don’t turn it into a nav bar. */}
              {!loading && !isAuthRoute && user ? (
                <>
                  <Button variant="ghost" onPress={() => go("/app")}>
                    App
                  </Button>

                  <Button variant="ghost" onPress={() => go("/app/account")}>
                    Account
                  </Button>
                </>
              ) : null}

              {!loading && !isAuthRoute && !user ? (
                <Button variant="primary" onPress={() => go("/login")}>
                  Demo
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
