import * as React from "react";
import type { CardProps } from "./Card.types";
import { cardTokens } from "../../theme";
import { px } from "../../utils/platform.web";

type WebProps = CardProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    className?: string; // escape hatch for apps/web Tailwind
  };

export function Card({
  children,
  variant = "default",
  padding = "md",
  radius = "lg",
  elevation = "none",
  className = "",
  style,
  ...props
}: WebProps & { 
  variant?: keyof typeof cardTokens.variant,
  padding?: keyof typeof cardTokens.padding,
  radius?: keyof typeof cardTokens.radius,
  elevation?: keyof typeof cardTokens.elevation
}) {
  const v = cardTokens.variant[variant as keyof typeof cardTokens.variant];
  const pad = cardTokens.padding[padding as keyof typeof cardTokens.padding];
  const r = cardTokens.radius[radius as keyof typeof cardTokens.radius];
  const e = cardTokens.elevation[elevation as keyof typeof cardTokens.elevation];

  const baseStyle: React.CSSProperties = {
    background: variant === "default" ? "var(--ui-bg)" : variant === "subtle" ? "var(--ui-subtle-bg)" : "transparent",
    color: "var(--ui-fg)",
    borderWidth: px(cardTokens.base.borderWidth),
    borderStyle: "solid",
    borderColor: variant === "outlined" ? "var(--ui-border)" : variant === "subtle" ? "transparent" : "var(--ui-border)",
    borderRadius: px(r),
    padding: px(pad),
    boxShadow: e.webShadow,
  };

  return (
    <div {...props} className={className} style={{ ...baseStyle, ...(style as any) }}>
      {children}
    </div>
  );
}
