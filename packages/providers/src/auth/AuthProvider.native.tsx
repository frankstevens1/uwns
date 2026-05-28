import { createSupabaseClient } from "../supabase/createClient.native";
import { createAuthProvider } from "./AuthProvider.shared";
import { Linking } from "react-native";

const { AuthProvider, useAuth } = createAuthProvider(createSupabaseClient, {
  getInitialUrl: () => Linking.getInitialURL(),
  subscribe: (handler) => {
    const subscription = Linking.addEventListener("url", ({ url }) => handler(url));
    return { remove: () => subscription.remove() };
  },
});

export { AuthProvider, useAuth };
