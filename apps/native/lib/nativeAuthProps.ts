import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@repo/providers";
import { toUiAuthClient } from "./uiAuthAdapter";

export function useNativeAuthWiring() {
  const auth = useAuth();

  const notify = {
    success: (title: string, opts?: { description?: string }) =>
      Alert.alert(title, opts?.description ?? ""),
    error: (title: string, opts?: { description?: string }) =>
      Alert.alert(title, opts?.description ?? ""),
  };

  const navigate = (href: string) => router.push(href as any);

  return { auth: toUiAuthClient(auth), notify, navigate };
}
