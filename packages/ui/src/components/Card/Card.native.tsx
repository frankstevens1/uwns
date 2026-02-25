import { Platform, StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import type { CardProps } from "./Card.types";
import { cardTokens, useThemeTokens } from "../../theme";

type NativeProps = CardProps &
  Omit<ViewProps, "children"> & {
    style?: ViewStyle | ViewStyle[];
  };

export function Card({
  children,
  variant = "default",
  padding = "md",
  radius = "lg",
  elevation = "none",
  style,
  ...props
}: NativeProps & { 
  variant?: keyof typeof cardTokens.variant,
  padding?: keyof typeof cardTokens.padding,
  radius?: keyof typeof cardTokens.radius,
  elevation?: keyof typeof cardTokens.elevation,
}) {
  const tokens = useThemeTokens();
  const v = {
    ...cardTokens.variant[variant],
    bg: variant === 'default' ? tokens.color.bg : variant === 'subtle' ? tokens.color.subtleBg : 'transparent',
    fg: tokens.color.fg,
    border: variant === 'outlined' ? tokens.color.border : variant === 'subtle' ? 'transparent' : tokens.color.border,
  };
  const pad = cardTokens.padding[padding];
  const r = cardTokens.radius[radius];
  const e = cardTokens.elevation[elevation];

  const platformShadow =
    Platform.OS === "ios"
      ? e.ios
      : Platform.OS === "android"
        ? e.android
        : {};

  return (
    <View
      {...props}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: cardTokens.base.borderWidth,
          borderRadius: r,
          padding: pad,
          ...(platformShadow as any),
        },
        style as any,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    // keep base minimal; recipe drives the rest
  },
});
