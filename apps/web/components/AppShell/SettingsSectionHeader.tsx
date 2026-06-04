"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, type LucideIcon } from "lucide-react";
import {
  settingsSections,
  type SettingsSection,
} from "@/components/Settings/settingsSections";

const settingsSectionIcons = {
  notifications: Bell,
  activities: Activity,
} satisfies Record<SettingsSection, LucideIcon>;

export function SettingsSectionHeader() {
  const pathname = usePathname();
  const activeSection =
    settingsSections.find((section) => pathname === section.href) ??
    settingsSections[0];

  return (
    <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-2 px-4">
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase leading-3 tracking-wide text-(--ui-muted-fg)">
          Settings
        </div>
        <h2 className="truncate text-lg font-semibold leading-6 tracking-tight">
          {activeSection.label}
        </h2>
      </div>

      <nav
        aria-label="Settings sections"
        className="flex shrink-0 flex-wrap items-center gap-0.5 rounded-md border border-(--ui-border) bg-(--ui-subtle-bg) p-0.5"
      >
        {settingsSections.map((section) => {
          const Icon = settingsSectionIcons[section.setting];
          const active = pathname === section.href;

          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-flex h-6 items-center gap-1 rounded px-2 text-xs font-medium transition",
                active
                  ? "bg-(--ui-bg) text-(--ui-fg)"
                  : "text-(--ui-muted-fg) hover:text-(--ui-fg)",
              ].join(" ")}
            >
              <Icon className="shrink-0" size={12} />
              <span>{section.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
