import * as Clipboard from "expo-clipboard";
import * as React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { ReadOnlyInputProps } from "./ReadOnlyInput.types";
import { inputTokens, useThemeTokens } from "../../theme";

type NativeProps = ReadOnlyInputProps & {
  style?: StyleProp<ViewStyle>;
};

export function ReadOnlyInput({
  label,
  value,
  loading = false,
  placeholder = "-",
  copyable = true,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  size = "md",
  style,
}: NativeProps) {
  const tokens = useThemeTokens();
  const [copied, setCopied] = React.useState(false);
  const displayValue = value ?? (loading ? "Loading..." : placeholder);
  const canCopy = copyable && Boolean(value);
  const t = inputTokens.base;
  const height = size === "sm" ? t.height.sm : t.height.md;
  const copyHeight = Math.max(24, height - 6);

  const onCopy = async () => {
    if (!value) return;

    await Clipboard.setStringAsync(value);
    setCopied(true);
    globalThis.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <View style={[styles.root, style]}>
      <Text style={[styles.label, { color: tokens.color.mutedFg }]}>
        {label}
      </Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: tokens.color.subtleBg,
            borderColor: tokens.color.border,
            borderRadius: t.radius,
            borderWidth: t.borderWidth,
            height,
            paddingLeft: t.paddingX,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            {
              color: tokens.color.fg,
              fontSize: t.fontSize,
              paddingRight: t.paddingX,
            },
          ]}
        >
          {displayValue}
        </Text>
        {copyable ? (
          <Pressable
            onPress={onCopy}
            disabled={!canCopy}
            style={({ pressed }) => [
              styles.copyButton,
              {
                height: copyHeight,
                opacity: !canCopy ? 0.5 : pressed ? 0.8 : 1,
                paddingHorizontal: size === "sm" ? 6 : 8,
              },
            ]}
          >
            <MaterialIcons
              name={copied ? "check" : "content-copy"}
              size={13}
              color={tokens.color.mutedFg}
            />
            <Text style={[styles.copyText, { color: tokens.color.mutedFg }]}>
              {copied ? copiedLabel : copyLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 4,
  },
  label: {
    fontSize: 14,
  },
  field: {
    alignItems: "center",
    flexDirection: "row",
    paddingRight: 4,
  },
  value: {
    flex: 1,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  copyButton: {
    alignItems: "center",
    borderRadius: 4,
    flexDirection: "row",
    gap: 4,
  },
  copyText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
