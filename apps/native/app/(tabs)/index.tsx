import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@repo/providers";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@repo/ui";

export default function HomeTab() {
  const { user, session, loading, signOut } = useAuth();
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
    <View style={styles.screen}>
      <Text style={styles.title}>UWNS • Native</Text>
      <Text style={styles.subtitle}>
        A minimal demo app wired to shared auth + shared UI.
      </Text>

      <Card padding="none" elevation="sm">
        <CardHeader>
          <Text style={styles.cardTitle}>Session</Text>
          <Text style={styles.cardSubtitle}>
            State from <Text style={styles.mono}>@repo/providers</Text>
          </Text>
        </CardHeader>

        <CardBody>
          <View style={styles.kv}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{status}</Text>
          </View>

          <View style={styles.kv}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email ?? "—"}</Text>
          </View>

          <View style={styles.kv}>
            <Text style={styles.label}>User ID</Text>
            <Text style={styles.value} numberOfLines={1}>
              {user?.id ?? "—"}
            </Text>
          </View>

          <View style={styles.kv}>
            <Text style={styles.label}>Session</Text>
            <Text style={styles.value}>
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
          <Text style={styles.cardTitle}>Next steps</Text>
          <Text style={styles.cardSubtitle}>
            This repo is meant to be a starting point.
          </Text>
        </CardHeader>

        <CardBody padding="sm">
          <Text style={styles.bullet}>• Replace this tab with your product home.</Text>
          <Text style={styles.bullet}>• Use shared UI + tokens for consistency.</Text>
          <Text style={styles.bullet}>• Keep routing + platform glue in the app.</Text>
        </CardBody>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "rgba(0,0,0,0.65)" },

  mono: { fontFamily: "System", fontWeight: "600" },

  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },

  cardTitle: { fontSize: 14, fontWeight: "600" },
  cardSubtitle: { marginTop: 4, fontSize: 13, color: "rgba(0,0,0,0.65)" },

  kv: { marginTop: 10 },
  label: { fontSize: 12, color: "rgba(0,0,0,0.55)" },
  value: { marginTop: 4, fontSize: 14, fontWeight: "600" },

  bullet: { fontSize: 13, color: "rgba(0,0,0,0.75)", marginTop: 6 },
});
