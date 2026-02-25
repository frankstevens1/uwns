import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@repo/providers";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@repo/ui";

export default function ModalScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.screen}>
      <Card padding="none" elevation="sm">
        <CardHeader>
          <Text style={styles.title}>Modal</Text>
          <Text style={styles.subtitle}>
            Root-level modal route (navigation example).
          </Text>
        </CardHeader>

        <CardBody>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.value}>{user?.email ?? "—"}</Text>
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
  screen: { padding: 24, gap: 12 },
  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },

  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { marginTop: 6, fontSize: 13, color: "rgba(0,0,0,0.65)" },

  label: { fontSize: 12, color: "rgba(0,0,0,0.55)" },
  value: { marginTop: 4, fontSize: 14, fontWeight: "600" },
});
