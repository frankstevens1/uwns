import { Text, type TextStyle, type TextProps } from "react-native";
import type { LinkProps } from "./Link.types";
import { labelTokens, useThemeTokens } from "../../theme";

type NativeProps = LinkProps &
  Omit<TextProps, "onPress" | "children"> & {
    style?: TextStyle | TextStyle[];
  };

export function Link({
  children,
  onPress,
  disabled,
  size = "md",
  tone = "default",
  style,
  ...props
}: NativeProps) {
  const tokens = useThemeTokens();
  return (
    <Text
      {...props}
      onPress={disabled ? undefined : onPress}
      accessibilityRole="link"
      style={[
        {
          color: tone === "muted" ? tokens.color.mutedFg : tokens.color.fg,
          fontSize: size === "sm" ? labelTokens.fontSize : undefined,
          fontWeight: size === "sm" ? "600" : undefined,
          opacity: disabled ? 0.6 : 1,
        },
        style as any,
      ]}
    >
      {children}
    </Text>
  );
}
