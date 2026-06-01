import { Alert, Linking, Platform } from "react-native";
import { PasswordResetCheckEmailForm, Welcome, getMailboxUrl } from "@repo/ui";
import { router, useLocalSearchParams } from "expo-router";
import * as ExpoLinking from "expo-linking";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";

async function openMailbox(email?: string) {
  const providerUrl = email ? getMailboxUrl(email) : undefined;
  const candidates = [
    ...(Platform.OS === "ios" ? ["message://"] : []),
    providerUrl,
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
  const { email, type } = useLocalSearchParams<{
    email?: string;
    type?: string;
  }>();
  const { auth, notify, navigate } = useNativeAuthWiring();

  const emailStr = typeof email === "string" ? email : undefined;
  const typeStr = typeof type === "string" ? type : undefined;
  const redirectTo = ExpoLinking.createURL("/update-password");

  if (typeStr === "recovery") {
    return (
      <PasswordResetCheckEmailForm
        auth={auth}
        email={emailStr}
        notify={notify}
        navigate={navigate}
        redirectTo={redirectTo}
        routes={{
          login: "/login",
          updatePassword: "/update-password",
        }}
        onOpenMailbox={() => openMailbox(emailStr)}
      />
    );
  }

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
