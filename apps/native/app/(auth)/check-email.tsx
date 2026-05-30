import { Alert, Linking, Platform } from "react-native";
import { Welcome } from "@repo/ui";
import { router, useLocalSearchParams } from "expo-router";
import { getMailboxUrl } from "@repo/ui";

async function openMailbox(email?: string) {
  const candidates = [
    ...(Platform.OS === "ios" ? ["message://"] : []),
    "mailto:",
    email ? getMailboxUrl(email) : undefined,
  ].filter((url): url is string => Boolean(url));

  for (const url of candidates) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) continue;

      await Linking.openURL(url);
      return;
    } catch {
      // Try the next candidate. Some devices/simulators report support but fail to open.
    }
  }

  Alert.alert("No mail app found", "Open your mail app to continue.");
}

export default function CheckEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  const emailStr = typeof email === "string" ? email : undefined;

  return (
    <Welcome
      email={emailStr}
      title="Check your email"
      description="We’ve sent you a link to continue."
      onOpenMailbox={() => openMailbox(emailStr)}
      onContinue={() => router.replace("/login")}
    />
  );
}
