import {
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from "react-native";
import type { ButtonProps } from "./Button.types";
import { buttonTokens } from "../../theme";
import { useThemeTokens } from "../../theme";
import { mergeNativeStyle } from "../../utils/platform.native";

type NativeProps = Omit<
  PressableProps,
  "children" | "style" | "disabled" | "onPress"
> &
  ButtonProps & {
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
  };

export function Button({
  title,
  children,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  onPress,
  style,
  textStyle,
  ...props
}: NativeProps) {
  const isDisabled = Boolean(disabled || loading);
  const content = children ?? title ?? null;

  const tokens = useThemeTokens();

  const sz = buttonTokens.size[size];

  // Base per-variant colors
  const baseBg = variant === "primary" ? tokens.color.primaryBg : tokens.color.bg;
  const baseFg = variant === "primary" ? tokens.color.primaryFg : tokens.color.fg;
  const baseBorder = variant === "ghost" ? tokens.color.border : "transparent";

  // NEW: disabled styling — no opacity dimming
  const disabledBg =
    // if you later add explicit disabled tokens, swap here:
    // tokens.color.disabledBg
    tokens.color.subtleBg;

  const disabledFg =
    // if you later add explicit disabled tokens, swap here:
    // tokens.color.disabledFg
    tokens.color.mutedFg;

  const resolvedBg = isDisabled ? disabledBg : baseBg;
  const resolvedFg = isDisabled ? disabledFg : baseFg;
  const resolvedBorder = isDisabled ? tokens.color.border : baseBorder;

  const activeOpacity = buttonTokens.variant[variant].activeOpacity;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading ? true : undefined,
      }}
      style={({ pressed }) =>
        mergeNativeStyle<ViewStyle>(
          styles.base,
          {
            height: sz.height,
            paddingHorizontal: sz.paddingX,
            backgroundColor: resolvedBg as any,
            borderColor: resolvedBorder as any,

            // IMPORTANT: keep opacity at 1 so text stays readable
            opacity: 1,
          },
          pressed && !isDisabled && {
            opacity: activeOpacity as any,
            transform: [{ scale: 0.99 }],
          },
          style as any
        )
      }
    >
      {typeof content === "string" ? (
        <Text
          style={[
            styles.text,
            {
              fontSize: sz.fontSize,
              color: resolvedFg as any,
              fontWeight: buttonTokens.base.fontWeight as any,
            },
            textStyle,
          ]}
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: buttonTokens.base.radius,
    borderWidth: buttonTokens.base.borderWidth,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  text: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
