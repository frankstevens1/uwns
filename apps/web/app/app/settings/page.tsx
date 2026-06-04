import { redirect } from "next/navigation";
import { defaultSettingsSection } from "@/components/Settings/settingsSections";

export default function SettingsIndexPage() {
  redirect(defaultSettingsSection.href);
}
