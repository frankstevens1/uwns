import { Pressable, View, Text as RNText, StyleSheet } from "react-native";
import type { CheckboxProps } from "./Checkbox.types";
import { useThemeTokens } from "../../theme";

export function Checkbox({ label, checked, onChange, disabled, style }: CheckboxProps) {
  const tokens = useThemeTokens();

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={[styles.row, style]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      hitSlop={10}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: tokens.color.border,
            borderRadius: tokens.radius.sm,
            backgroundColor: checked ? tokens.color.primaryBg : "transparent",
          },
          disabled && { opacity: tokens.opacity.disabled },
        ]}
      >
        {checked ? (
          <View
            style={[
              styles.dot,
              { backgroundColor: tokens.color.primaryFg, borderRadius: tokens.radius.sm },
            ]}
          />
        ) : null}
      </View>

      {label ? (
        <RNText style={{ color: disabled ? tokens.color.mutedFg : tokens.color.fg, fontSize: 13 }}>
          {label}
        </RNText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  box: {
    width: 16,
    height: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 8, height: 8 },
});
