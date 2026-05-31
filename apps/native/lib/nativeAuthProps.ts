import { Alert } from "react-native";
import { router } from "expo-router";
import { useActivity, useAuth } from "@repo/providers";
import { toUiAuthClient } from "./uiAuthAdapter";

export function useNativeAuthWiring(flow: "login" | "sign-up" = "login") {
  const auth = useAuth();
  const { trackEvent } = useActivity();

  const notify = {
    success: (title: string, opts?: { description?: string }) =>
      Alert.alert(title, opts?.description ?? ""),
    error: (title: string, opts?: { description?: string }) =>
      Alert.alert(title, opts?.description ?? ""),
  };

  const navigate = (href: string) => router.push(href as any);

  return { auth: toUiAuthClient(auth, { flow, trackEvent }), notify, navigate };
}
