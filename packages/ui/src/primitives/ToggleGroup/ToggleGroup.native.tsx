import * as React from "react";
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { baseTokens, buttonTokens, useThemeTokens } from "../../theme";
import type {
  ToggleGroupItemProps,
  ToggleGroupProps,
  ToggleGroupValue,
} from "./ToggleGroup.types";

type ToggleGroupContextValue = {
  value: ToggleGroupValue;
  onValueChange: (value: ToggleGroupValue) => void;
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null,
);

function useToggleGroupContext(componentName: string) {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error(`${componentName} must be used within ToggleGroup.`);
  }
  return context;
}

type NativeToggleGroupProps = ToggleGroupProps & {
  style?: StyleProp<ViewStyle>;
};

type NativeToggleGroupItemProps = ToggleGroupItemProps & {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function ToggleGroup({
  children,
  value,
  onValueChange,
  ariaLabel,
  style,
}: NativeToggleGroupProps) {
  const tokens = useThemeTokens();
  const contextValue = React.useMemo<ToggleGroupContextValue>(
    () => ({ onValueChange, value }),
    [onValueChange, value],
  );

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <View
        accessibilityLabel={ariaLabel}
        style={[
          {
            alignSelf: "stretch",
            flexDirection: "row",
            gap: 4,
            padding: 3,
            borderRadius: buttonTokens.base.radius,
            borderWidth: 1,
            borderColor: tokens.color.border,
            backgroundColor: "transparent",
          },
          style,
        ]}
      >
        {children}
      </View>
    </ToggleGroupContext.Provider>
  );
}

export function ToggleGroupItem({
  children,
  value,
  disabled = false,
  style,
  textStyle,
}: NativeToggleGroupItemProps) {
  const tokens = useThemeTokens();
  const group = useToggleGroupContext("ToggleGroupItem");
  const selected = group.value === value;
  const content =
    typeof children === "string" || typeof children === "number" ? (
      <Text
        numberOfLines={1}
        style={[
          {
            color: selected ? tokens.color.fg : tokens.color.mutedFg,
            fontSize: baseTokens.fontSize.sm,
            fontWeight: baseTokens.fontWeight.medium as any,
            lineHeight: baseTokens.fontSize.sm,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    ) : (
      children
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => {
        if (disabled || selected) return;
        group.onValueChange(value);
      }}
      style={({ pressed }) => [
          {
            flex: 1,
            minHeight: 32,
            minWidth: 0,
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            borderRadius: buttonTokens.base.radius,
          borderWidth: 1,
          borderColor: selected ? tokens.color.border : "transparent",
          backgroundColor: selected ? tokens.color.subtleBg : "transparent",
          opacity: disabled ? tokens.opacity.disabled : 1,
          overflow: "hidden",
        },
        pressed && !disabled ? { transform: [{ scale: 0.99 }] } : null,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}
