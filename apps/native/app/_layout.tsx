import { Stack } from "expo-router";
import { ActivityProvider, AuthProvider } from "@repo/providers";
import { ThemeProvider, darkTokens, lightTokens } from "@repo/ui";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const scheme = useColorScheme();
  const tokens = scheme === "dark" ? darkTokens : lightTokens;

  return (
    <AuthProvider>
      <ActivityProvider>
        <ThemeProvider tokens={tokens}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Auth routes */}
            <Stack.Screen name="(auth)" />

            {/* App routes */}
            <Stack.Screen name="(tabs)" />

            {/* Modal (protected inside the screen itself) */}
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </ActivityProvider>
    </AuthProvider>
  );
}
