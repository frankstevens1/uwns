import * as React from "react";
import { cx } from "../../utils/cx";
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
  contentId: string;
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
  className,
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
      <div className={className} style={style}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  children,
  className,
  disabled = false,
  style,
  value,
}: AccordionItemProps) {
  const accordion = useAccordionContext("AccordionItem");
  const contentId = React.useId();
  const open = accordion.value === value;

  const contextValue = React.useMemo<AccordionItemContextValue>(
    () => ({ contentId, disabled, open, value }),
    [contentId, disabled, open, value],
  );

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <div
        className={className}
        data-state={open ? "open" : "closed"}
        style={style}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
  disabled = false,
  style,
  "aria-label": ariaLabel,
}: AccordionTriggerProps) {
  const accordion = useAccordionContext("AccordionTrigger");
  const item = useAccordionItemContext("AccordionTrigger");
  const isDisabled = disabled || item.disabled;

  return (
    <button
      type="button"
      aria-controls={item.contentId}
      aria-expanded={item.open}
      aria-label={ariaLabel}
      className={cx(className)}
      data-state={item.open ? "open" : "closed"}
      disabled={isDisabled}
      onClick={() => {
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
    </button>
  );
}

export function AccordionContent({
  children,
  className,
  style,
}: AccordionContentProps) {
  const item = useAccordionItemContext("AccordionContent");
  if (!item.open) return null;

  return (
    <div
      id={item.contentId}
      className={className}
      data-state="open"
      role="region"
      style={style}
    >
      {children}
    </div>
  );
}
