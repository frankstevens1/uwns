export const settingsSections = [
  {
    setting: "notifications",
    href: "/app/settings/notifications",
    label: "Notifications",
    description: "Delivery preferences and notification history",
  },
  {
    setting: "activities",
    href: "/app/settings/activities",
    label: "Activities",
    description: "Activity platforms and event history",
  },
] as const;

export type SettingsSection = (typeof settingsSections)[number]["setting"];

export const defaultSettingsSection = settingsSections[0];

export function isSettingsSection(value: string): value is SettingsSection {
  return settingsSections.some((section) => section.setting === value);
}
