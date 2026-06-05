"use client";

import * as React from "react";
import Link from "next/link";
import { Github, Mail } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitch";

const FOOTER_H = 64;

export default function MarketingFooter({ footerHeight }: { footerHeight?: number }) {
  const year = new Date().getFullYear();

  const MAILTO = process.env.NEXT_PUBLIC_MAILTO || "frank@datafluent.one";
  const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "frankstevens1";

  return (
    <footer
      className={[
        "fixed bottom-0 left-0 right-0 z-30",
        "bg-(--ui-panel)/80 supports-backdrop-filter:backdrop-blur",
        "transition-colors",
        "print:hidden",
      ].join(" ")}
      style={{ height: footerHeight || FOOTER_H }}
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <div className="flex flex-col gap-1 text-xs text-(--ui-muted-fg) sm:flex-row sm:items-center sm:gap-4">
          <span>
            {year} © <span className="font-medium text-(--ui-fg)">datafluent</span>
          </span>

          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/legal?document=privacy" className="hover:text-(--ui-fg) transition-colors">
              Privacy
            </Link>
            <Link href="/legal?document=terms" className="hover:text-(--ui-fg) transition-colors">
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
