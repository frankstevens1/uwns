import type * as React from "react";

export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = "md" | "sm" | "lg";

export type ButtonProps = {
  /**
   * Prefer children to allow icons / rich content.
   * `title` exists for backwards compatibility (RN-first usage).
   */
  children?: React.ReactNode;
  title?: string;

  variant?: ButtonVariant;
  size?: ButtonSize;

  disabled?: boolean;
  /**
   * Optional loading state. Implemented as "disabled + aria-busy" on web,
   * and disables presses on native.
   */
  loading?: boolean;

  /**
   * Cross-platform press handler.
   * Web maps to onClick.
   */
  onPress?: (...args: any[]) => void;
};
