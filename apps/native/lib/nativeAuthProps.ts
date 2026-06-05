import { Alert } from "react-native";
import { router } from "expo-router";
import { useActions, useAuth } from "@repo/providers";
import { toUiAuthClient } from "./uiAuthAdapter";

export function useNativeAuthWiring(flow: "login" | "sign-up" = "login") {
  const auth = useAuth();
  const { trackAction } = useActions();

  const notify = {
    success: (title: string, opts?: { description?: string }) =>
      Alert.alert(title, opts?.description ?? ""),
    error: (title: string, opts?: { description?: string }) =>
      Alert.alert(title, opts?.description ?? ""),
  };

  const navigate = (href: string) => router.push(href as any);

  return { auth: toUiAuthClient(auth, { flow, trackAction }), notify, navigate };
}
