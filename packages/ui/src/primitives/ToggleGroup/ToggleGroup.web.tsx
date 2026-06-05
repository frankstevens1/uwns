import * as React from "react";
import { buttonTokens, baseTokens } from "../../theme";
import { cx } from "../../utils/cx";
import { mergeWebStyle, px } from "../../utils/platform.web";
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

export function ToggleGroup({
  children,
  value,
  onValueChange,
  ariaLabel,
  className = "",
  style,
}: ToggleGroupProps) {
  const contextValue = React.useMemo<ToggleGroupContextValue>(
    () => ({ onValueChange, value }),
    [onValueChange, value],
  );

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "stretch",
    flexWrap: "wrap",
    gap: px(2),
    padding: px(4),
    borderRadius: px(buttonTokens.base.radius),
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--ui-border)",
    backgroundColor: "var(--ui-subtle-bg)",
  };

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <div
        aria-label={ariaLabel}
        className={className}
        role="group"
        style={mergeWebStyle(baseStyle, style as React.CSSProperties)}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export function ToggleGroupItem({
  children,
  value,
  disabled = false,
  className = "",
  style,
}: ToggleGroupItemProps) {
  const group = useToggleGroupContext("ToggleGroupItem");
  const selected = group.value === value;

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    minHeight: px(24),
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: px(4),
    paddingLeft: px(8),
    paddingRight: px(8),
    borderRadius: px(buttonTokens.base.radius),
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: selected ? "var(--ui-border)" : "transparent",
    backgroundColor: selected ? "var(--ui-bg)" : "transparent",
    color: selected ? "var(--ui-fg)" : "var(--ui-muted-fg)",
    fontSize: px(baseTokens.fontSize.sm),
    fontWeight: baseTokens.fontWeight.medium as any,
    lineHeight: 1,
    whiteSpace: "nowrap",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 140ms ease, border-color 140ms ease, color 140ms ease",
    opacity: disabled ? "var(--ui-disabled-opacity, 0.6)" : 1,
  };

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(className)}
      data-state={selected ? "on" : "off"}
      disabled={disabled}
      onClick={() => {
        if (disabled || selected) return;
        group.onValueChange(value);
      }}
      style={mergeWebStyle(baseStyle, style as React.CSSProperties)}
      onMouseEnter={(e) => {
        if (disabled || selected) return;
        e.currentTarget.style.color = "var(--ui-fg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = selected
          ? "var(--ui-fg)"
          : "var(--ui-muted-fg)";
      }}
    >
      {children}
    </button>
  );
}
