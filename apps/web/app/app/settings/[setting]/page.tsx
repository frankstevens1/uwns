import { notFound } from "next/navigation";
import { ActivitiesSettingsSection } from "@/components/Settings/ActivitiesSettingsSection";
import { NotificationSettingsSection } from "@/components/Settings/NotificationSettingsSection";
import {
  isSettingsSection,
  settingsSections,
} from "@/components/Settings/settingsSections";

export function generateStaticParams() {
  return settingsSections.map(({ setting }) => ({ setting }));
}

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ setting: string }>;
}) {
  const { setting } = await params;

  if (!isSettingsSection(setting)) {
    notFound();
  }

  if (setting === "activities") {
    return <ActivitiesSettingsSection />;
  }

  return <NotificationSettingsSection />;
}
