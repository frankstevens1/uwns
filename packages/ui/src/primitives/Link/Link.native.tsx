import { Text, type TextStyle, type TextProps } from "react-native";
import type { LinkProps } from "./Link.types";
import { useThemeTokens } from "../../theme";

type NativeProps = LinkProps &
  Omit<TextProps, "onPress" | "children"> & {
    style?: TextStyle | TextStyle[];
  };

export function Link({ children, onPress, disabled, style, ...props }: NativeProps) {
  const tokens = useThemeTokens();
  return (
    <Text
      {...props}
      onPress={disabled ? undefined : onPress}
      accessibilityRole="link"
      style={[
        {
          color: tokens.color.fg,
          textDecorationLine: "underline",
          opacity: disabled ? 0.6 : 1,
        },
        style as any,
      ]}
    >
      {children}
    </Text>
  );
}
