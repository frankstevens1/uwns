import { Pressable, View } from "react-native";
import type { IconButtonProps } from "./IconButton.types";
import { useThemeTokens } from "../../theme";

export function IconButton({ onPress, disabled, children }: IconButtonProps) {
  const tokens = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: 32,
          height: 32,
          borderRadius: tokens.radius.md,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.color.bg,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <View>{children}</View>
    </Pressable>
  );
}
