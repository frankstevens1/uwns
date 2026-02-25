import { Linking } from "react-native";
import { Welcome } from "@repo/ui";
import { router, useLocalSearchParams } from "expo-router";
import { getMailboxUrl } from "@repo/ui";

export default function CheckEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  const emailStr = typeof email === "string" ? email : undefined;

  return (
    <Welcome
      email={emailStr}
      title="Check your email"
      description="We’ve sent you a link to continue."
      onOpenMailbox={
        emailStr ? () => Linking.openURL(getMailboxUrl(emailStr)) : undefined
      }
      onContinue={() => router.replace("/login")}
    />
  );
}
