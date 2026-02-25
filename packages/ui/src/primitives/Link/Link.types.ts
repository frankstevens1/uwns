import type * as React from "react";

/**
 * Cross-platform Link primitive.
 * - Web renders <a>
 * - Native renders <Text> (pressable)
 */
export type LinkProps = {
  children: React.ReactNode;
  href?: string;
  onPress?: () => void;
  disabled?: boolean;
};
