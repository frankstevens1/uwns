"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
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
} from "lucide-react";
import { Button } from "@repo/ui";
import { useAuth } from "@repo/providers";

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
      .filter((x) => x && typeof x.href === "string" && typeof x.label === "string")
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))
      .slice(0, RECENTS_MAX);
  } catch {
    return [];
  }
}

function writeRecents(next: RecentItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next.slice(0, RECENTS_MAX)));
  } catch {
    // ignore
  }
}

function bumpRecent(item: { id: string; label: string; href: string }) {
  const curr = readRecents();
  const now = Date.now();
  const filtered = curr.filter((r) => r.href !== item.href);
  const next: RecentItem[] = [{ ...item, ts: now }, ...filtered].slice(0, RECENTS_MAX);
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
    setRecents(() => bumpRecent({ id: href, label: labelForRecent ?? href, href }));
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
        id: "legal",
        label: "Legal",
        href: "/legal",
        icon: <FileText size={14} />,
        keywords: ["privacy", "terms"],
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
      { heading: "Recent", items: recentItems.filter(allow), emptyText: "No recent items yet." },
      { heading: "Navigate", items: navigate.filter(allow) },
      {
        heading: "Actions",
        items: actions.filter(allow),
        emptyText: isAuthed ? "No actions available." : "Sign in to access actions.",
      },
      {
        heading: "Docs",
        items: docs.filter(allow),
        emptyText: ff.docs ? "No docs items." : "Docs are disabled by feature flags.",
      },
    ];

    const injected = (extraSections ?? []).map((s) => ({
      ...s,
      items: s.items.filter(allow),
    }));

    return [...base, ...injected].filter((s) => s.items.length > 0 || !!s.emptyText);
  }, [recents, isAuthed, ff, extraSections, signOut, router]);

  const closeOnEscCapture = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    close();
  };

  return (
    <>
      <Button
        variant="ghost"
        onPress={() => setOpen(true)}
        aria-label="Search"
        className={[!compact ? "min-w-52" : "", "flex items-center justify-between"].join(" ")}
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
          <kbd className="ml-2 rounded bg-(--ui-subtle-bg) px-1.5 py-0.5 text-xs font-light tracking-[0.2em]">⌘K</kbd>
        ) : null}
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          {/* Overlay darkness stays consistent because only one instance hotkeys */}
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
          <Dialog.Content
            aria-describedby={undefined}
            className={[
              "fixed left-1/2 top-[16%] z-50 w-[min(92vw,520px)] -translate-x-1/2",
              "rounded-xl bg-(--ui-panel) shadow-2xl ring-1 ring-(--ui-border)",
              "focus:outline-none",
            ].join(" ")}
            onKeyDownCapture={closeOnEscCapture}
            onKeyUpCapture={closeOnEscCapture}
            onPointerDownOutside={() => close()}
          >
            <Dialog.Title className="sr-only">Search</Dialog.Title>

            <div className="p-2.5">
              <CommandRoot
                inputRef={inputRef}
                sections={sections}
                onGo={(href, label) => go(href, label)}
                onAction={runAction}
                onEscCapture={closeOnEscCapture}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
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
    <Command className="w-full" onKeyDownCapture={onEscCapture} onKeyUpCapture={onEscCapture}>
      <div className="flex items-center gap-2 rounded-lg bg-(--ui-subtle-bg) px-3 py-2">
        <Search size={14} className="text-(--ui-muted-fg)" />
        <Command.Input
          ref={(el) => {
            inputRef.current = el;
          }}
          placeholder="Search…"
          className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-(--ui-muted-fg)"
          onKeyDownCapture={onEscCapture}
          onKeyUpCapture={onEscCapture}
        />
      </div>

      <Command.List
        className={[
          "mt-2.5 max-h-75 overflow-y-auto rounded-lg",
          "pt-1.5",
          "[scrollbar-width:none]",
          "[-ms-overflow-style:none]",
          "[&::-webkit-scrollbar]:hidden",
        ].join(" ")}
      >
        <Command.Empty className="px-3 py-6 text-center text-sm text-(--ui-muted-fg)">
          No results.
        </Command.Empty>

        {sections.map((section) => (
          <Command.Group
            key={section.heading}
            heading={section.heading}
            // ✅ Correct selector to style cmdk heading safely (no clipping)
            className={[
              "text-xs text-(--ui-muted-fg)",
              "**:[[cmdk-group-heading]]:px-3",
              "**:[[cmdk-group-heading]]:pt-2",
              "**:[[cmdk-group-heading]]:pb-1",
            ].join(" ")}
          >
            <div className="px-1">
              {section.items.length === 0 ? (
                section.emptyText ? (
                  <div className="px-3 py-2 text-sm text-(--ui-muted-fg)">{section.emptyText}</div>
                ) : null
              ) : (
                section.items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={[item.label, item.href ?? "", ...(item.keywords ?? [])].join(" ")}
                    onSelect={() => {
                      if (item.href) onGo(item.href, item.label);
                      else onAction(item);
                    }}
                    className={[
                      "flex cursor-pointer select-none items-center justify-between gap-3",
                      "rounded-lg px-3 py-2 text-sm",
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
                      <span className="text-xs text-(--ui-muted-fg) truncate">{item.href}</span>
                    ) : (
                      <span className="text-xs text-(--ui-muted-fg)">Action</span>
                    )}
                  </Command.Item>
                ))
              )}
            </div>
          </Command.Group>
        ))}

        <div className="mt-2 px-3 pb-2 text-xs text-(--ui-muted-fg)">
          ↑↓ then Enter — ESC closes
        </div>
      </Command.List>
    </Command>
  );
}
