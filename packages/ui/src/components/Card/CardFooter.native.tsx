import { StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import type { CardSectionProps } from "./CardSection.types";
import { cardTokens, useThemeTokens } from "../../theme";

type NativeProps = CardSectionProps &
  Omit<ViewProps, "children"> & {
    style?: ViewStyle | ViewStyle[];
  };

export function CardFooter({
  children,
  padding = "md",
  divider = true,
  style,
  ...props
}: NativeProps) {
  const pad = cardTokens.section.padding[padding];

  const tokens = useThemeTokens();
  return (
    <View
      {...props}
      style={[
        styles.base,
        { padding: pad },
        divider && { borderTopWidth: 1, borderTopColor: tokens.color.border },
        style as any,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
});
