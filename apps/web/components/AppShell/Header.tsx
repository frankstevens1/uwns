"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, Settings, X } from "lucide-react";
import { Button } from "@repo/ui";
import { useActions, useAuth, useNotifications } from "@repo/providers";
import { LogoUwns } from "../LogoSvg";
import { UserMenu } from "../UserMenu";
import ThemeSwitcher from "@/components/ThemeSwitch";
import { SearchCommand } from "./SearchCommand";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

export const APP_HEADER_HEIGHT = 56;
export const SETTINGS_SECTION_HEADER_HEIGHT = 52;

export default function AppHeader({
  title,
  headerHeight,
}: {
  title: string;
  headerHeight?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, signOut } = useAuth();
  const { trackAction } = useActions();
  const { unreadCount } = useNotifications();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const trackedSettingsViewedRef = React.useRef(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const go = (href: string) => router.push(href);

  const onSignOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await trackAction({
        actionName: "signed_out",
        metadata: { trigger: "app_header" },
      });
      await signOut();
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  };

  const showSettingsHeader = pathname?.startsWith("/app/settings");
  const settingsHeaderHeight = showSettingsHeader
    ? Math.max(
        0,
        (headerHeight ?? APP_HEADER_HEIGHT + SETTINGS_SECTION_HEADER_HEIGHT) -
          APP_HEADER_HEIGHT,
      )
    : 0;

  React.useEffect(() => {
    if (!showSettingsHeader || trackedSettingsViewedRef.current) return;

    trackedSettingsViewedRef.current = true;
    void trackAction({
      actionName: "settings_viewed",
      uniqueKey: "web:settings_viewed",
      metadata: {
        source: "navigation",
        screen: "settings",
        trigger: "first_page_visit",
      },
    });
  }, [showSettingsHeader, trackAction]);

  return (
    <header
      aria-label={`${title} app header`}
      className={[
        "fixed left-0 right-0 top-0 z-30",
        "bg-(--ui-panel)/80 supports-backdrop-filter:backdrop-blur",
        "transition-colors",
        "print:hidden",
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
          <UserMenu signOutSource="app_header" />
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

              <Button
                variant="ghost"
                onPress={() => go("/app/settings/actions")}
              >
                <span className="inline-flex items-center gap-2">
                  <Settings size={16} />
                  Settings
                </span>
              </Button>

              <div className="flex items-center justify-between rounded-xl bg-(--ui-subtle-bg) px-3 py-2">
                <div className="text-sm text-(--ui-muted-fg)">Theme</div>
                <ThemeSwitcher />
              </div>

              <Button
                variant="ghost"
                onPress={onSignOut}
                disabled={busy || loading}
              >
                {busy ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
