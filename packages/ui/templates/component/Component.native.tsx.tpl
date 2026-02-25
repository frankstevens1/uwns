import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { {{ComponentName}}Props } from "./{{ComponentName}}.types";

export function {{ComponentName}}({ children, onPress }: {{ComponentName}}Props) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={({ pressed }: any) => [
        styles.base,
        onPress && pressed && styles.pressed,
      ]}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  pressed: {
    opacity: 0.9,
  },
});
