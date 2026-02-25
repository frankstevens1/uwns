export type InputSize = "sm" | "md";

export type InputProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;

  disabled?: boolean;
  error?: boolean;
  size?: InputSize;

  /**
   * Cross-platform change handler (web maps onChange -> onChangeText).
   */
  onChangeText?: (value: string) => void;

  /**
   * Cross-platform “type” (native maps password -> secureTextEntry,
   * number -> numeric keyboard, date -> numeric date entry fallback).
   */
  type?: "text" | "email" | "password" | "number" | "date";

  // Web conveniences
  id?: string;
  name?: string;
  autoComplete?: string;
};
