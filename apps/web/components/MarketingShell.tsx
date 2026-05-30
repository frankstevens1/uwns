"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Github, Mail, Menu, X } from "lucide-react";
import { Button } from "@repo/ui";
import { useAuth } from "@repo/providers";
import ThemeSwitcher from "@/components/ThemeSwitch";
import { LogoUwns } from "./LogoSvg";

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
      <MarketingHeader title={title} />

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

        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      </div>

      <MarketingFooter />
    </div>
  );
}

function MarketingHeader({ title }: { title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

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

  // One primary action: "View demo" (logged out) or "Enter app" (logged in).
  const primaryHref = user ? "/app" : "/login";
  const primaryLabel = user ? "Demo" : "Demo";

  return (
    <header
      className={[
        "fixed left-0 right-0 top-0 z-30",
        "bg-(--ui-panel)/80 supports-backdrop-filter:backdrop-blur",
        "transition-colors",
      ].join(" ")}
      style={{ height: HEADER_H }}
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <LogoUwns className="h-6 w-auto text-foreground" version={"1"} />
        </Link>

        {/* Desktop: quiet utilities + one CTA */}
        <div className="hidden items-center gap-2 sm:flex">
          {!loading && !isAuthRoute && (
            <Button variant="primary" onPress={() => go(primaryHref)}>
              {primaryLabel}
            </Button>
          )}
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

              <Button variant="ghost" onPress={() => go("/legal")}>
                Legal
              </Button>

              {/* Keep this minimal. Don’t turn it into a nav bar. */}
              {!loading && !isAuthRoute && (
                <Button variant="primary" onPress={() => go(primaryHref)}>
                  {primaryLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MarketingFooter() {
  const year = new Date().getFullYear();

  const MAILTO = process.env.NEXT_PUBLIC_MAILTO || process.env.MAILTO || "frank@datafluent.one";
  const GITHUB_USERNAME =
    process.env.NEXT_PUBLIC_GITHUB_USERNAME || process.env.GITHUB_USERNAME || "frankstevens1";

  const PRIVACY_URL = process.env.NEXT_PUBLIC_PRIVACY_URL || "/legal#privacy";
  const TERMS_URL = process.env.NEXT_PUBLIC_TERMS_URL || "/legal#terms";

  return (
    <footer
      className={[
        "fixed bottom-0 left-0 right-0 z-30",
        "bg-(--ui-panel)/80 supports-backdrop-filter:backdrop-blur",
        "transition-colors",
      ].join(" ")}
      style={{ height: FOOTER_H }}
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <div className="flex flex-col gap-1 text-xs text-(--ui-muted-fg) sm:flex-row sm:items-center sm:gap-4">
          <span>
            {year} © <span className="font-medium text-(--ui-fg)">datafluent</span>
          </span>

          <div className="hidden items-center gap-4 sm:flex">
            <Link href={PRIVACY_URL} className="hover:text-(--ui-fg) transition-colors">
              Privacy
            </Link>
            <Link href={TERMS_URL} className="hover:text-(--ui-fg) transition-colors">
              Terms
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 text-(--ui-muted-fg)">
          {MAILTO ? (
            <Link
              href={`mailto:${MAILTO}`}
              className="inline-flex items-center hover:text-(--ui-fg) transition-colors"
              aria-label="Email"
            >
              <Mail size={18} />
            </Link>
          ) : null}

          {GITHUB_USERNAME ? (
            <Link
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-(--ui-fg) transition-colors"
              aria-label="GitHub"
            >
              <Github size={18} />
            </Link>
          ) : null}

          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}
