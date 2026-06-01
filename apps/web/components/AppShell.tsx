"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Home, User } from "lucide-react";
import { Button } from "@repo/ui";
import { useActivity, useAuth } from "@repo/providers";
import { LogoUwns } from "./LogoSvg";
import ThemeSwitcher from "@/components/ThemeSwitch";
import { SearchCommand } from "./SearchCommand";

const HEADER_H = 56;
const BOTTOM_FADE_H = 18;

export function AppShell({
  title = "df",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-(--ui-bg) text-(--ui-fg)">
      <AppHeader title={title} />

      <div
        className="no-scrollbar relative overflow-y-auto"
        style={{
          paddingTop: HEADER_H,
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
            bottom: 0,
            height: BOTTOM_FADE_H,
            background:
              "linear-gradient(to top, var(--ui-fade-from), rgba(0,0,0,0))",
          }}
        />

        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      </div>
    </div>
  );
}

function AppHeader({ title }: { title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { trackEvent } = useActivity();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (userMenuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (userMenuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const go = (href: string) => router.push(href);

  const onSignOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await trackEvent({
        eventName: "signed_out",
        metadata: { trigger: "app_header" },
      });
      await signOut();
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  };

  const avatarSeed = encodeURIComponent(user?.id ?? "user");
  const avatarUrl = `https://api.dicebear.com/10.x/glyphs/svg?seed=${avatarSeed}`;

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

        {/* Desktop */}
        <div className="hidden items-center gap-4 sm:flex">
          <SearchCommand hotkey />
          <ThemeSwitcher />

          <div className="relative flex h-9 items-center" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-full",
                "text-(--ui-fg)",
                "transition",
                "focus:outline-none focus:ring-2 focus:ring-(--ui-border)",
              ].join(" ")}
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full rounded-full border border-transparent bg-(--ui-subtle-bg) transition-colors hover:border-(--ui-muted-fg)"
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                className={[
                  "absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg",
                  "bg-(--ui-panel) shadow-lg",
                  "ring-1 ring-(--ui-border)",
                ].join(" ")}
              >
                <div className="px-3 py-2">
                  <div className="text-xs text-(--ui-muted-fg)">Signed in as</div>
                  <div className="truncate text-sm font-medium">{user?.email}</div>
                </div>

                <div className="h-px bg-(--ui-border)" />

                <button
                  type="button"
                  onClick={() => go("/app")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-(--ui-subtle-bg) transition"
                >
                  <Home size={16} />
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => go("/app/account")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-(--ui-subtle-bg) transition"
                >
                  <User size={16} />
                  Account
                </button>

                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={busy || loading}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-(--ui-subtle-bg) transition disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {busy ? "Signing out…" : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <SearchCommand compact hotkey={false} />
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
        <div className="bg-(--ui-panel)/95 supports-backdrop-filter:backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 pb-3 pt-2">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" onPress={() => go("/app")}>
                Home
              </Button>

              <Button variant="ghost" onPress={() => go("/app/account")}>
                Account
              </Button>

              <div className="flex items-center justify-between rounded-xl bg-(--ui-subtle-bg) px-3 py-2">
                <div className="text-sm text-(--ui-muted-fg)">Theme</div>
                <ThemeSwitcher />
              </div>

              <Button variant="ghost" onPress={onSignOut} disabled={busy || loading}>
                {busy ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
