import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@repo/providers";
import { Button, Card, CardBody, CardFooter, CardHeader, useThemeTokens } from "@repo/ui";

export default function ModalScreen() {
  const { user } = useAuth();
  const tokens = useThemeTokens();

  return (
    <View style={[styles.screen, { backgroundColor: tokens.color.bg }]}>
      <Card padding="none" elevation="sm">
        <CardHeader>
          <Text style={[styles.title, { color: tokens.color.fg }]}>Modal</Text>
          <Text style={[styles.subtitle, { color: tokens.color.mutedFg }]}>
            Root-level modal route (navigation example).
          </Text>
        </CardHeader>

        <CardBody>
          <Text style={[styles.label, { color: tokens.color.mutedFg }]}>Signed in as</Text>
          <Text style={[styles.value, { color: tokens.color.fg }]}>{user?.email ?? "—"}</Text>
        </CardBody>

        <CardFooter>
          <View style={styles.row}>
            <Button onPress={() => router.back()}>Close</Button>
            <Button variant="ghost" onPress={() => router.replace("/(tabs)")}>
              Go Home
            </Button>
          </View>
        </CardFooter>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, gap: 12 },
  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },

  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { marginTop: 6, fontSize: 13 },

  label: { fontSize: 12 },
  value: { marginTop: 4, fontSize: 14, fontWeight: "600" },
});
