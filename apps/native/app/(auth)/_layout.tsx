import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useThemeTokens } from "@repo/ui";

export default function AuthLayout() {
  const tokens = useThemeTokens();
  const backgroundStyle = { backgroundColor: tokens.color.bg };

  return (
    <View style={[styles.root, backgroundStyle]}>
      <View style={[styles.container, backgroundStyle]}>

        <View style={[styles.stack, backgroundStyle]}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
              contentStyle: [styles.content, backgroundStyle],
            }}
          />
        </View>

        <Text style={[styles.footer, { color: tokens.color.mutedFg }, backgroundStyle]}>datafluent</Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },

  container: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
  },
  
  stack: {
    flex: 1,
    justifyContent: "center",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    paddingTop: 16,
    paddingBottom: 12,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
});
