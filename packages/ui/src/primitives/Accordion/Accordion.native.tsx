import * as React from "react";
import { Pressable, View } from "react-native";
import type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionRootProps,
  AccordionTriggerProps,
  AccordionValue,
} from "./Accordion.types";

type AccordionContextValue = {
  value: AccordionValue;
  allowCollapse: boolean;
  setValue: (value: AccordionValue) => void;
};

type AccordionItemContextValue = {
  value: string;
  disabled: boolean;
  open: boolean;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext =
  React.createContext<AccordionItemContextValue | null>(null);

function useAccordionContext(componentName: string) {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error(`${componentName} must be used within AccordionRoot.`);
  }
  return context;
}

function useAccordionItemContext(componentName: string) {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error(`${componentName} must be used within AccordionItem.`);
  }
  return context;
}

export function AccordionRoot({
  allowCollapse = true,
  children,
  defaultValue = null,
  onValueChange,
  style,
  value,
}: AccordionRootProps) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<AccordionValue>(defaultValue);
  const currentValue = value === undefined ? uncontrolledValue : value;

  const setValue = React.useCallback(
    (nextValue: AccordionValue) => {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  const contextValue = React.useMemo<AccordionContextValue>(
    () => ({ allowCollapse, setValue, value: currentValue }),
    [allowCollapse, currentValue, setValue],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <View style={style}>{children}</View>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  children,
  disabled = false,
  style,
  value,
}: AccordionItemProps) {
  const accordion = useAccordionContext("AccordionItem");
  const open = accordion.value === value;

  const contextValue = React.useMemo<AccordionItemContextValue>(
    () => ({ disabled, open, value }),
    [disabled, open, value],
  );

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <View style={style}>{children}</View>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  disabled = false,
  style,
  "aria-label": accessibilityLabel,
}: AccordionTriggerProps) {
  const accordion = useAccordionContext("AccordionTrigger");
  const item = useAccordionItemContext("AccordionTrigger");
  const isDisabled = disabled || item.disabled;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, expanded: item.open }}
      disabled={isDisabled}
      onPress={() => {
        if (isDisabled) return;
        if (item.open) {
          if (accordion.allowCollapse) {
            accordion.setValue(null);
          }
          return;
        }
        accordion.setValue(item.value);
      }}
      style={style}
    >
      {children}
    </Pressable>
  );
}

export function AccordionContent({ children, style }: AccordionContentProps) {
  const item = useAccordionItemContext("AccordionContent");
  if (!item.open) return null;

  return <View style={style}>{children}</View>;
}
