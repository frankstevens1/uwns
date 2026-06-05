"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  ArrowRight,
  LogOut,
  Home,
  FileText,
  BookOpen,
  Sparkles,
  User,
  Settings,
  Bell,
  Activity,
} from "lucide-react";
import {
  Button,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "@repo/ui";
import { useActions, useAuth } from "@repo/providers";

type FeatureFlags = {
  docs?: boolean;
  playground?: boolean;
};

type CommandItem = {
  id: string;
  label: string;
  href?: string;
  action?: () => void | Promise<void>;
  keywords?: string[];
  icon?: React.ReactNode;
  when?: "authed" | "guest" | "always";
  flag?: keyof FeatureFlags;
};

type CommandSection = {
  heading: string;
  items: CommandItem[];
  emptyText?: string;
};

type RecentItem = {
  id: string;
  label: string;
  href: string;
  ts: number;
};

const RECENTS_KEY = "uwns.command.recents.v1";
const RECENTS_MAX = 6;

function readRecents(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as RecentItem[]) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x) => x && typeof x.href === "string" && typeof x.label === "string",
      )
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))
      .slice(0, RECENTS_MAX);
  } catch {
    return [];
  }
}

function writeRecents(next: RecentItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      RECENTS_KEY,
      JSON.stringify(next.slice(0, RECENTS_MAX)),
    );
  } catch {
    // ignore
  }
}

function bumpRecent(item: { id: string; label: string; href: string }) {
  const curr = readRecents();
  const now = Date.now();
  const filtered = curr.filter((r) => r.href !== item.href);
  const next: RecentItem[] = [{ ...item, ts: now }, ...filtered].slice(
    0,
    RECENTS_MAX,
  );
  writeRecents(next);
  return next;
}

function useFeatureFlags(explicit?: FeatureFlags): FeatureFlags {
  return React.useMemo(() => {
    if (explicit) return explicit;

    const raw =
      process.env.NEXT_PUBLIC_FEATURE_FLAGS ||
      process.env.NEXT_PUBLIC_UWNS_FEATURE_FLAGS;

    if (!raw) return { docs: true, playground: false };

    try {
      const parsed = JSON.parse(raw) as FeatureFlags;
      return { docs: true, playground: false, ...parsed };
    } catch {
      return { docs: true, playground: false };
    }
  }, [explicit]);
}

export function SearchCommand({
  compact = false,
  hotkey = true,
  flags,
  extraSections,
}: {
  compact?: boolean;
  /** IMPORTANT: set false on the "secondary" mounted instance (e.g. mobile) */
  hotkey?: boolean;
  flags?: FeatureFlags;
  extraSections?: CommandSection[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { trackAction } = useActions();

  const ff = useFeatureFlags(flags);
  const isAuthed = !!user && !loading;

  const [open, setOpen] = React.useState(false);
  const [recents, setRecents] = React.useState<RecentItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setRecents(readRecents());
  }, [pathname]);

  // ✅ Only ONE instance listens for Cmd/Ctrl+K
  React.useEffect(() => {
    if (!hotkey) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = typeof e.key === "string" ? e.key : "";
      const isK = key.toLowerCase() === "k" || e.code === "KeyK";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hotkey]);

  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const close = React.useCallback(() => setOpen(false), []);

  // ESC close: capture + keydown/keyup to beat cmdk + focus trap
  React.useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      close();
    };

    window.addEventListener("keydown", handler, true);
    window.addEventListener("keyup", handler, true);

    return () => {
      window.removeEventListener("keydown", handler, true);
      window.removeEventListener("keyup", handler, true);
    };
  }, [open, close]);

  const go = (href: string, labelForRecent?: string) => {
    setRecents(() =>
      bumpRecent({ id: href, label: labelForRecent ?? href, href }),
    );
    close();
    router.push(href);
  };

  const runAction = async (item: CommandItem) => {
    close();
    if (item.action) await item.action();
  };

  const sections = React.useMemo<CommandSection[]>(() => {
    const navigate: CommandItem[] = [
      {
        id: "home",
        label: "Home",
        href: "/",
        icon: <ArrowRight size={14} />,
        keywords: ["landing"],
        when: "always",
      },
      {
        id: "app",
        label: "Home",
        href: "/app",
        icon: <Home size={14} />,
        keywords: ["home", "product", "overview", "feed"],
        when: "always",
      },
      {
        id: "privacy",
        label: "Privacy Policy",
        href: "/legal?document=privacy",
        icon: <FileText size={14} />,
        keywords: ["privacy", "policy", "legal"],
        when: "always",
      },
      {
        id: "terms",
        label: "Terms of Service",
        href: "/legal?document=terms",
        icon: <FileText size={14} />,
        keywords: ["terms", "legal"],
        when: "always",
      },
      {
        id: "login",
        label: "Sign in",
        href: "/login",
        icon: <ArrowRight size={14} />,
        keywords: ["auth", "login"],
        when: "guest",
      },
      {
        id: "signup",
        label: "Create account",
        href: "/sign-up",
        icon: <ArrowRight size={14} />,
        keywords: ["register", "signup"],
        when: "guest",
      },
    ];

    const actions: CommandItem[] = [
      {
        id: "account",
        label: "Account",
        href: "/app/account",
        icon: <User size={14} />,
        keywords: ["user", "profile", "identity", "settings"],
        when: "authed",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/app/settings/notifications",
        icon: <Settings size={14} />,
        keywords: ["preferences", "settings"],
        when: "authed",
      },
      {
        id: "notification-settings",
        label: "Notification settings",
        href: "/app/settings/notifications",
        icon: <Bell size={14} />,
        keywords: ["notifications", "push", "email", "preferences"],
        when: "authed",
      },
      {
        id: "action-settings",
        label: "Action settings",
        href: "/app/settings/actions",
        icon: <Activity size={14} />,
        keywords: ["actions", "tracked", "audit"],
        when: "authed",
      },
      {
        id: "playground",
        label: "Playground",
        href: "/app/playground",
        icon: <Sparkles size={14} />,
        keywords: ["demo", "sandbox"],
        when: "authed",
        flag: "playground",
      },
      {
        id: "logout",
        label: "Sign out",
        icon: <LogOut size={14} />,
        keywords: ["logout", "sign out"],
        when: "authed",
        action: async () => {
          await trackAction({
            actionName: "signed_out",
            metadata: { trigger: "search_command" },
          });
          await signOut();
          router.replace("/login");
        },
      },
    ];

    const docs: CommandItem[] = [
      {
        id: "docs",
        label: "Docs",
        href: "/docs",
        icon: <BookOpen size={14} />,
        keywords: ["documentation", "guide"],
        when: "always",
        flag: "docs",
      },
      {
        id: "components",
        label: "UI Components",
        href: "/docs/components",
        icon: <BookOpen size={14} />,
        keywords: ["ui", "components", "command"],
        when: "always",
        flag: "docs",
      },
    ];

    const recentItems: CommandItem[] = recents.map((r) => ({
      id: `recent:${r.href}`,
      label: r.label,
      href: r.href,
      icon: <ArrowRight size={14} />,
      keywords: ["recent"],
      when: "always",
    }));

    const allow = (item: CommandItem) => {
      const okAuth =
        item.when === "always" ||
        (item.when === "authed" && isAuthed) ||
        (item.when === "guest" && !isAuthed);
      if (!okAuth) return false;
      if (item.flag && !ff[item.flag]) return false;
      return true;
    };

    const base: CommandSection[] = [
      {
        heading: "Recent",
        items: recentItems.filter(allow),
        emptyText: "No recent items yet.",
      },
      { heading: "Navigate", items: navigate.filter(allow) },
      {
        heading: "Actions",
        items: actions.filter(allow),
        emptyText: isAuthed
          ? "No actions available."
          : "Sign in to access actions.",
      },
      {
        heading: "Docs",
        items: docs.filter(allow),
        emptyText: ff.docs
          ? "No docs items."
          : "Docs are disabled by feature flags.",
      },
    ];

    const injected = (extraSections ?? []).map((s) => ({
      ...s,
      items: s.items.filter(allow),
    }));

    return [...base, ...injected].filter(
      (s) => s.items.length > 0 || !!s.emptyText,
    );
  }, [recents, isAuthed, ff, extraSections, signOut, router, trackAction]);

  const closeOnEscCapture = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    close();
  };

  return (
    <>
      <Button
        variant="outline"
        onPress={() => setOpen(true)}
        aria-label="Search"
        className={[
          !compact ? "min-w-52" : "",
          "flex items-center justify-between",
        ].join(" ")}
      >
        <div className="flex items-center flex-1">
          <Search size={18} />
          {!compact ? (
            <span className="ml-2 text-left hidden md:inline text-sm text-(--ui-muted-fg)">
              Search
            </span>
          ) : null}
        </div>
        {!compact ? (
          <kbd className="ml-2 rounded bg-(--ui-subtle-bg) px-1.5 py-0.5 text-xs font-light tracking-[0.2em]">
            ⌘K
          </kbd>
        ) : null}
      </Button>

      <DialogRoot open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent
            aria-describedby={undefined}
            className={[
              "w-[min(92vw,520px)] max-w-[520px] overflow-hidden",
              "rounded-xl shadow-2xl",
            ].join(" ")}
            style={{ padding: 12 }}
            onKeyDownCapture={closeOnEscCapture}
            onKeyUpCapture={closeOnEscCapture}
            onPointerDownOutside={() => close()}
          >
            <DialogTitle className="sr-only">Search</DialogTitle>

            <CommandRoot
              inputRef={inputRef}
              sections={sections}
              onGo={(href, label) => go(href, label)}
              onAction={runAction}
              onEscCapture={closeOnEscCapture}
            />
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </>
  );
}

function CommandRoot({
  sections,
  onGo,
  onAction,
  inputRef,
  onEscCapture,
}: {
  sections: CommandSection[];
  onGo: (href: string, label?: string) => void;
  onAction: (item: CommandItem) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onEscCapture: (e: React.KeyboardEvent) => void;
}) {
  return (
    <Command
      className="w-full"
      onKeyDownCapture={onEscCapture}
      onKeyUpCapture={onEscCapture}
    >
      <div className="flex items-center gap-1.5 rounded-lg bg-(--ui-subtle-bg) px-2.5 py-1.5">
        <Search size={14} className="text-(--ui-muted-fg)" />
        <Command.Input
          ref={(el) => {
            inputRef.current = el;
          }}
          placeholder="Search…"
          className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-(--ui-muted-fg)"
          onKeyDownCapture={onEscCapture}
          onKeyUpCapture={onEscCapture}
        />
      </div>

      <div className="relative mt-2">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-4 rounded-t-lg"
          style={{
            background:
              "linear-gradient(to bottom, var(--ui-fade-from), rgba(0,0,0,0))",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-4"
          style={{
            background:
              "linear-gradient(to top, var(--ui-fade-from), rgba(0,0,0,0))",
          }}
        />
        <Command.List
          className={[
            "max-h-75 overflow-y-auto rounded-lg",
            "pb-3 pt-1",
            "[scrollbar-width:none]",
            "[-ms-overflow-style:none]",
            "[&::-webkit-scrollbar]:hidden",
          ].join(" ")}
        >
          <Command.Empty className="px-2.5 py-4 text-center text-sm text-(--ui-muted-fg)">
            No results.
          </Command.Empty>

          {sections.map((section) => (
            <Command.Group
              key={section.heading}
              heading={section.heading}
              // ✅ Correct selector to style cmdk heading safely (no clipping)
              className={[
                "text-xs text-(--ui-muted-fg)",
                "**:[[cmdk-group-heading]]:px-2.5",
                "**:[[cmdk-group-heading]]:pt-1.5",
                "**:[[cmdk-group-heading]]:pb-0.5",
              ].join(" ")}
            >
              <div className="px-1">
                {section.items.length === 0 ? (
                  section.emptyText ? (
                    <div className="px-2.5 py-2 text-sm text-(--ui-muted-fg)">
                      {section.emptyText}
                    </div>
                  ) : null
                ) : (
                  section.items.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={[
                        item.label,
                        item.href ?? "",
                        ...(item.keywords ?? []),
                      ].join(" ")}
                      onSelect={() => {
                        if (item.href) onGo(item.href, item.label);
                        else onAction(item);
                      }}
                      className={[
                        "flex cursor-pointer select-none items-center justify-between gap-3",
                        "rounded-lg px-2.5 py-1.5 text-sm",
                        "aria-selected:bg-(--ui-subtle-bg)",
                        "transition",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 text-(--ui-muted-fg)">
                          {item.icon ?? <ArrowRight size={14} />}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </span>

                      {item.href ? (
                        <span className="text-xs text-(--ui-muted-fg) truncate">
                          {item.href}
                        </span>
                      ) : (
                        <span className="text-xs text-(--ui-muted-fg)">
                          Action
                        </span>
                      )}
                    </Command.Item>
                  ))
                )}
              </div>
            </Command.Group>
          ))}
        </Command.List>
      </div>

      <div className="border-t border-(--ui-border) px-2.5 pb-0.5 pt-1.5 text-xs text-(--ui-muted-fg)">
        ↑↓ then Enter — ESC closes
      </div>
    </Command>
  );
}
