"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Home, LogOut, Menu, Settings, User, X } from "lucide-react";
import { Button } from "@repo/ui";
import { useActivity, useAuth, useNotifications } from "@repo/providers";
import { LogoUwns } from "../LogoSvg";
import ThemeSwitcher from "@/components/ThemeSwitch";
import { SearchCommand } from "./SearchCommand";
import NotificationTrayItem from "./NotificationTrayItem";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

const appRoutes = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/account", label: "Account", icon: User },
  { href: "/app/settings/notifications", label: "Settings", icon: Settings },
] as const;

export const APP_HEADER_HEIGHT = 56;
export const SETTINGS_SECTION_HEADER_HEIGHT = 52;

export default function AppHeader({ title, headerHeight }: { title: string, headerHeight?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { trackEvent } = useActivity();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
  } = useNotifications();

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
  const visibleRoutes = appRoutes.filter(
    (route) =>
      pathname !== route.href &&
      !(
        route.href.startsWith("/app/settings") &&
        pathname?.startsWith("/app/settings")
      ),
  );
  const unreadNotifications = notifications.filter((notification) => !notification.read_at);
  const notificationPreview = unreadNotifications.slice(0, 5);
  const showSettingsHeader = pathname?.startsWith("/app/settings");
  const settingsHeaderHeight = showSettingsHeader
    ? Math.max(
        0,
        (headerHeight ?? APP_HEADER_HEIGHT + SETTINGS_SECTION_HEADER_HEIGHT) -
          APP_HEADER_HEIGHT,
      )
    : 0;

  return (
    <header
      aria-label={`${title} app header`}
      className={[
        "fixed left-0 right-0 top-0 z-30",
        "bg-(--ui-panel)/80 supports-backdrop-filter:backdrop-blur",
        "transition-colors",
      ].join(" ")}
      style={{ height: headerHeight ?? APP_HEADER_HEIGHT }}
    >
      <div
        className="mx-auto flex max-w-5xl items-center justify-between px-4"
        style={{ height: APP_HEADER_HEIGHT }}
      >
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
                "relative",
                "inline-flex h-9 w-9 items-center justify-center rounded-full",
                "text-(--ui-fg)",
                "transition",
                "focus:outline-none focus:ring-2 focus:ring-(--ui-border)",
              ].join(" ")}
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              <Image
                src={avatarUrl}
                alt=""
                width={36}
                height={36}
                loading="eager"
                unoptimized
                className="h-full w-full rounded-full border border-transparent bg-(--ui-subtle-bg) transition-colors hover:border-(--ui-muted-fg)"
                aria-hidden="true"
              />
              {unreadCount > 0 ? (
                <span
                  aria-label={`${unreadCount} unread notifications`}
                  className={[
                    "absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full",
                    "bg-(--ui-primary-bg) px-1 text-[10px] font-semibold leading-none text-(--ui-primary-fg)",
                    "ring-2 ring-(--ui-panel)",
                  ].join(" ")}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {menuOpen && (
              <div
                className={[
                  "absolute right-0 top-full mt-2 flex max-h-[min(34rem,calc(100dvh-5rem))] w-80.75 flex-col overflow-hidden rounded-lg",
                  "bg-(--ui-panel) shadow-lg",
                  "ring-1 ring-(--ui-border)",
                ].join(" ")}
              >
                <div className="px-3 py-2">
                  <div className="text-xs text-(--ui-muted-fg)">Signed in as</div>
                  <div className="truncate text-sm font-medium">{user?.email}</div>
                </div>

                <div className="h-px bg-(--ui-border)" />

                <section className="flex min-h-0 flex-col py-2">
                  <div className="flex items-center justify-between px-3 pb-1">
                    <div className="text-xs font-medium text-(--ui-muted-fg)">
                      Notifications
                      {unreadCount > 0 ? ` (${unreadCount})` : ""}
                    </div>
                    <Link
                      href="/app/settings/notifications"
                      onClick={() => setMenuOpen(false)}
                      className="cursor-pointer text-xs font-medium text-(--ui-muted-fg) transition hover:text-(--ui-fg)"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="relative min-h-0">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-3"
                      style={{
                        background:
                          "linear-gradient(to bottom, var(--ui-fade-from), rgba(0,0,0,0))",
                      }}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-3"
                      style={{
                        background:
                          "linear-gradient(to top, var(--ui-fade-from), rgba(0,0,0,0))",
                      }}
                    />
                    <div className="no-scrollbar max-h-72 min-h-0 overflow-y-auto px-1">
                      {notificationsLoading ? (
                        <div className="px-3 py-4 text-sm text-(--ui-muted-fg)">
                          Loading notifications...
                        </div>
                      ) : notificationsError ? (
                        <div className="px-3 py-4 text-sm text-(--ui-muted-fg)">
                          Notifications are unavailable.
                        </div>
                      ) : notificationPreview.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-(--ui-muted-fg)">
                          No unread notifications.
                        </div>
                      ) : (
                        notificationPreview.map((notification) => (
                          <NotificationTrayItem
                            key={notification.id}
                            notification={notification}
                            onOpen={() => setMenuOpen(false)}
                            onMarkAsRead={() => void markAsRead(notification.id)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </section>

                <div className="h-px bg-(--ui-border)" />

                <div className="py-1">
                  {visibleRoutes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <button
                        key={route.href}
                        type="button"
                        onClick={() => go(route.href)}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition hover:bg-(--ui-subtle-bg)"
                      >
                        <Icon size={16} />
                        {route.label}
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-(--ui-border)" />

                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={busy || loading}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition hover:bg-(--ui-subtle-bg) disabled:cursor-not-allowed disabled:opacity-50"
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

      {showSettingsHeader ? (
        <div style={{ height: settingsHeaderHeight }}>
          <SettingsSectionHeader />
        </div>
      ) : null}

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

              <Button
                variant="ghost"
                onPress={() => go("/app/settings/notifications")}
              >
                <span className="inline-flex items-center gap-2">
                  <Bell size={16} />
                  Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
                </span>
              </Button>

              <Button variant="ghost" onPress={() => go("/app/settings/activities")}>
                <span className="inline-flex items-center gap-2">
                  <Settings size={16} />
                  Settings
                </span>
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
