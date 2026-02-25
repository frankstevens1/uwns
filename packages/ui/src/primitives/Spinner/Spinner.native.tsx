import { ActivityIndicator } from "react-native";
import type { SpinnerProps } from "./Spinner.types";
import { useThemeTokens } from "../../theme";

export function Spinner({ size = "md" }: SpinnerProps) {
  const tokens = useThemeTokens();
  return <ActivityIndicator size={size === "sm" ? "small" : "large"} color={tokens.color.fg} />;
}
