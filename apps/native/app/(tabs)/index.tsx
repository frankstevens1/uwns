import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@repo/providers";
import { Button, Card, CardBody, CardFooter, CardHeader, useThemeTokens } from "@repo/ui";

export default function HomeTab() {
  const { user, session, loading, signOut } = useAuth();
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = React.useState(false);

  const status = loading ? "Loading…" : user ? "Signed in" : "Signed out";

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
      <Text style={[styles.title, { color: tokens.color.fg }]}>UWNS • Native</Text>
      <Text style={[styles.subtitle, { color: tokens.color.mutedFg }]}>
        A minimal demo app wired to shared auth + shared UI.
      </Text>

      <Card padding="none" elevation="sm">
        <CardHeader>
          <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>Session</Text>
          <Text style={[styles.cardSubtitle, { color: tokens.color.mutedFg }]}>
            State from <Text style={styles.mono}>@repo/providers</Text>
          </Text>
        </CardHeader>

        <CardBody>
          <View style={styles.kv}>
            <Text style={[styles.label, { color: tokens.color.mutedFg }]}>Status</Text>
            <Text style={[styles.value, { color: tokens.color.fg }]}>{status}</Text>
          </View>

          <View style={styles.kv}>
            <Text style={[styles.label, { color: tokens.color.mutedFg }]}>Email</Text>
            <Text style={[styles.value, { color: tokens.color.fg }]}>{user?.email ?? "—"}</Text>
          </View>

          <View style={styles.kv}>
            <Text style={[styles.label, { color: tokens.color.mutedFg }]}>User ID</Text>
            <Text style={[styles.value, { color: tokens.color.fg }]} numberOfLines={1}>
              {user?.id ?? "—"}
            </Text>
          </View>

          <View style={styles.kv}>
            <Text style={[styles.label, { color: tokens.color.mutedFg }]}>Session</Text>
            <Text style={[styles.value, { color: tokens.color.fg }]}>
              {session ? "Active" : loading ? "—" : "None"}
            </Text>
          </View>
        </CardBody>

        <CardFooter>
          <View style={styles.row}>
            <Button
              onPress={() => router.push("/modal")}
              disabled={loading}
            >
              Open modal
            </Button>

            <Button
              variant="ghost"
              onPress={onSignOut}
              disabled={loading || !user || busy}
            >
              {busy ? "Signing out…" : "Sign out"}
            </Button>
          </View>
        </CardFooter>
      </Card>

      <Card padding="none" variant="subtle">
        <CardHeader divider={false}>
          <Text style={[styles.cardTitle, { color: tokens.color.fg }]}>Next steps</Text>
          <Text style={[styles.cardSubtitle, { color: tokens.color.mutedFg }]}>
            This repo is meant to be a starting point.
          </Text>
        </CardHeader>

        <CardBody padding="sm">
          <Text style={[styles.bullet, { color: tokens.color.mutedFg }]}>• Replace this tab with your product home.</Text>
          <Text style={[styles.bullet, { color: tokens.color.mutedFg }]}>• Use shared UI + tokens for consistency.</Text>
          <Text style={[styles.bullet, { color: tokens.color.mutedFg }]}>• Keep routing + platform glue in the app.</Text>
        </CardBody>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13 },

  mono: { fontFamily: "System", fontWeight: "600" },

  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },

  cardTitle: { fontSize: 14, fontWeight: "600" },
  cardSubtitle: { marginTop: 4, fontSize: 13 },

  kv: { marginTop: 10 },
  label: { fontSize: 12 },
  value: { marginTop: 4, fontSize: 14, fontWeight: "600" },

  bullet: { fontSize: 13, marginTop: 6 },
});
