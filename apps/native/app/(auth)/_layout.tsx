import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

const BG = "#fff";

export default function AuthLayout() {
  return (
    <View style={styles.root}>
      <View style={styles.container}>

        <View style={styles.stack}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
              contentStyle: styles.content,
            }}
          />
        </View>

        <Text style={styles.footer}>datafluent</Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    backgroundColor: BG,
  },

  container: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    backgroundColor: BG,
  },
  
  stack: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: BG,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },

  footer: {
    paddingTop: 16,
    paddingBottom: 12,
    textAlign: "center",
    fontSize: 12,
    color: "rgba(0,0,0,0.45)",
    fontWeight: "500",
    backgroundColor: BG,
  },
});
