import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@repo/providers";
import { Button, Card, CardBody, CardFooter, CardHeader, useThemeTokens } from "@repo/ui";

export default function SettingsTab() {
  const { user, loading, signOut } = useAuth();
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = React.useState(false);

  const onSignOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signOut();
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, backgroundColor: tokens.color.bg }]}>
      <Text style={[styles.title, { color: tokens.color.fg }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: tokens.color.mutedFg }]}>Account + navigation examples.</Text>

      <Card padding="none" elevation="sm">
        <CardHeader>
          <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>Account</Text>
          <Text style={[styles.cardSubtitle, { color: tokens.color.mutedFg }]}>Signed in identity + actions.</Text>
        </CardHeader>

        <CardBody>
          <Text style={[styles.label, { color: tokens.color.mutedFg }]}>Email</Text>
          <Text style={[styles.value, { color: tokens.color.fg }]}>{user?.email ?? (loading ? "Loading…" : "—")}</Text>

          <Text style={[styles.label, { marginTop: 12, color: tokens.color.mutedFg }]}>User ID</Text>
          <Text style={[styles.value, { color: tokens.color.fg }]} numberOfLines={1}>
            {user?.id ?? (loading ? "Loading…" : "—")}
          </Text>
        </CardBody>

        <CardFooter>
          <View style={styles.column}>
            <Button
              variant="ghost"
              onPress={onSignOut}
              disabled={loading || !user || busy}
            >
              {busy ? "Signing out…" : "Sign out"}
            </Button>

            <Button onPress={() => router.push("/modal")} disabled={loading}>
              Open modal
            </Button>
          </View>
        </CardFooter>
      </Card>

      <Card padding="none" variant="subtle">
        <CardHeader divider={false}>
          <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>Auth routes</Text>
          <Text style={[styles.cardSubtitle, { color: tokens.color.mutedFg }]}>
            Test authentication flows.
          </Text>
        </CardHeader>

        <CardBody padding="sm">
          <View style={styles.column}>
            <Button variant="ghost" onPress={() => router.push("/login")}>
              Login
            </Button>
            <Button variant="ghost" onPress={() => router.push("/sign-up")}>
              Sign up
            </Button>
            <Button
              variant="ghost"
              onPress={() => router.push("/forgot-password")}
            >
              Forgot password
            </Button>
          </View>
        </CardBody>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13 },

  column: { gap: 10 },

  cardTitle: { fontSize: 14, fontWeight: "600" },
  cardSubtitle: { marginTop: 4, fontSize: 13 },

  label: { fontSize: 12 },
  value: { marginTop: 4, fontSize: 14, fontWeight: "600" },
});
