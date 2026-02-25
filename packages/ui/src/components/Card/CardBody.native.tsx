import { StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import type { CardSectionProps } from "./CardSection.types";
import { cardTokens } from "../../theme";

type NativeProps = CardSectionProps &
  Omit<ViewProps, "children"> & {
    style?: ViewStyle | ViewStyle[];
  };

export function CardBody({ children, padding = "md", style, ...props }: NativeProps) {
  const pad = cardTokens.section.padding[padding];
  return (
    <View {...props} style={[styles.base, { padding: pad }, style as any]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
});
