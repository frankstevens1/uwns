import type * as React from "react";

export type ToggleGroupValue = string;

export type ToggleGroupProps = {
  children: React.ReactNode;
  value: ToggleGroupValue;
  onValueChange: (value: ToggleGroupValue) => void;

  ariaLabel?: string;
  className?: string;
  style?: any;
};

export type ToggleGroupItemProps = {
  children: React.ReactNode;
  value: ToggleGroupValue;
  disabled?: boolean;

  className?: string;
  style?: any;
};
