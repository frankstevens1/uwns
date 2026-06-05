"use client";

import { usePathname, useRouter } from "next/navigation";
import { Activity, Bell, type LucideIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui";
import {
  settingsSections,
  type SettingsSection,
} from "@/components/Settings/settingsSections";

const settingsSectionIcons = {
  notifications: Bell,
  actions: Activity,
} satisfies Record<SettingsSection, LucideIcon>;

export function SettingsSectionHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const activeSection =
    settingsSections.find((section) => pathname === section.href) ??
    settingsSections[0];

  const selectSection = (nextSection: SettingsSection) => {
    const section = settingsSections.find((entry) => entry.setting === nextSection);
    if (!section) return;
    router.push(section.href);
  };

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

      <ToggleGroup
        value={activeSection.setting}
        onValueChange={(nextSection) =>
          selectSection(nextSection as SettingsSection)
        }
        ariaLabel="Settings sections"
      >
        {settingsSections.map((section) => {
          const Icon = settingsSectionIcons[section.setting];

          return (
            <ToggleGroupItem key={section.href} value={section.setting}>
              <Icon className="shrink-0" size={12} />
              <span>{section.label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
