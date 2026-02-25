import type * as React from "react";

export type AuthCardProps = {
  title: string;
  subtitle?: string;

  children: React.ReactNode;
  footer?: React.ReactNode;
};
