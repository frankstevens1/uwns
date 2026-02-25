import type * as React from "react";

export type SettingsRowProps = {
  label: React.ReactNode;
  description?: React.ReactNode;
  summary?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  style?: any;
};
