import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@repo/providers";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@repo/ui";

export default function SettingsTab() {
  const { user, loading, signOut } = useAuth();
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
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Account + navigation examples.</Text>

      <Card padding="none" elevation="sm">
        <CardHeader>
          <Text style={styles.cardTitle}>Account</Text>
          <Text style={styles.cardSubtitle}>Signed in identity + actions.</Text>
        </CardHeader>

        <CardBody>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? (loading ? "Loading…" : "—")}</Text>

          <Text style={[styles.label, { marginTop: 12 }]}>User ID</Text>
          <Text style={styles.value} numberOfLines={1}>
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
          <Text style={styles.cardTitle}>Debug routes</Text>
          <Text style={styles.cardSubtitle}>
            Helpful shortcuts while building.
          </Text>
        </CardHeader>

        <CardBody padding="sm">
          <View style={styles.column}>
            <Button variant="ghost" onPress={() => router.push("/login")}>
              Auth: Login
            </Button>
            <Button variant="ghost" onPress={() => router.push("/sign-up")}>
              Auth: Sign up
            </Button>
            <Button
              variant="ghost"
              onPress={() => router.push("/forgot-password")}
            >
              Auth: Forgot password
            </Button>
          </View>
        </CardBody>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "rgba(0,0,0,0.65)" },

  column: { gap: 10 },

  cardTitle: { fontSize: 14, fontWeight: "600" },
  cardSubtitle: { marginTop: 4, fontSize: 13, color: "rgba(0,0,0,0.65)" },

  label: { fontSize: 12, color: "rgba(0,0,0,0.55)" },
  value: { marginTop: 4, fontSize: 14, fontWeight: "600" },
});
