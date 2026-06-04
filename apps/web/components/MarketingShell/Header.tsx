"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@repo/ui";
import { useAuth } from "@repo/providers";
import { LogoUwns } from "../LogoSvg";

const HEADER_H = 56;

export default function MarketingHeader({ title, headerHeight }: { title: string; headerHeight?: number }) {
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
      style={{ height: headerHeight || HEADER_H }}
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