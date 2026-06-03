import type * as React from "react";

export type PasswordFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;

  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  autoComplete?: "current-password" | "new-password" | "password" | "password-new";
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;

  /**
   * For web: forwarded to <input>.
   * For native: ignored (secureTextEntry is handled internally).
   */
  id?: string;
  name?: string;

  /**
   * Optional: render something on the right side instead of the default show/hide toggle.
   * Useful later if you add proper icons.
   */
  rightAccessory?: React.ReactNode;
  labelAccessory?: React.ReactNode;
};
