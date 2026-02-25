"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // Sonner tokens → UWNS tokens
          "--normal-bg": "var(--ui-bg)",
          "--normal-text": "var(--ui-fg)",
          "--normal-border": "var(--ui-border)",

          // If you want the toast to read as “surface” rather than page bg:
          "--success-bg": "var(--ui-bg)",
          "--success-text": "var(--ui-fg)",
          "--error-bg": "var(--ui-bg)",
          "--error-text": "var(--ui-fg)",
          "--warning-bg": "var(--ui-bg)",
          "--warning-text": "var(--ui-fg)",
          "--info-bg": "var(--ui-bg)",
          "--info-text": "var(--ui-fg)",

          // A reasonable default radius; if you later expose --ui-radius-lg, swap to that.
          "--border-radius": "14px",

          // Optional: small shadow that works in both themes
          "--shadow": "0 8px 30px rgba(0,0,0,0.12)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
