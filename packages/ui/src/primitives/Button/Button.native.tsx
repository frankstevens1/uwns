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
  const baseBg =
    variant === "primary"
      ? tokens.color.primaryBg
      : variant === "outline"
        ? tokens.color.bg
        : "transparent";
  const baseFg =
    variant === "primary" ? tokens.color.primaryFg : tokens.color.fg;
  const baseBorder =
    variant === "outline" ? tokens.color.border : "transparent";

  const disabledBg =
    variant === "ghost" ? "transparent" : tokens.color.subtleBg;

  const disabledFg = tokens.color.mutedFg;

  const resolvedBg = isDisabled ? disabledBg : baseBg;
  const resolvedFg = isDisabled ? disabledFg : baseFg;
  const resolvedBorder = isDisabled
    ? variant === "outline"
      ? tokens.color.border
      : "transparent"
    : baseBorder;

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
          pressed &&
            !isDisabled && {
              opacity: activeOpacity as any,
              backgroundColor:
                variant === "primary"
                  ? resolvedBg
                  : (tokens.color.subtleBg as any),
              transform: [{ scale: 0.99 }],
            },
          style as any,
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
