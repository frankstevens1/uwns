import type * as React from "react";

export type AccordionValue = string | null;

export type AccordionRootProps = {
  children?: React.ReactNode;
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  onValueChange?: (value: AccordionValue) => void;
  allowCollapse?: boolean;

  className?: string;
  style?: any;
};

export type AccordionItemProps = {
  children?: React.ReactNode;
  value: string;
  disabled?: boolean;

  className?: string;
  style?: any;
};

export type AccordionTriggerProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  "aria-label"?: string;

  className?: string;
  style?: any;
};

export type AccordionContentProps = {
  children?: React.ReactNode;

  className?: string;
  style?: any;
};
