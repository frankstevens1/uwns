import type * as React from "react";

export type IconButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;

  // web only
  "aria-label"?: string;
};
