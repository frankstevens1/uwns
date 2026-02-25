import { Text } from "react-native";
import type { LabelProps } from "./Label.types";
import { labelTokens, useThemeTokens } from "../../theme";

export function Label({ children }: LabelProps) {
  const tokens = useThemeTokens();
  return (
    <Text style={{ fontSize: labelTokens.fontSize, fontWeight: "600", color: tokens.color.mutedFg }}>
      {children}
    </Text>
  );
}
