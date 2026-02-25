import * as React from "react";
import type { CardSectionProps } from "./CardSection.types";
import { cardTokens } from "../../theme";
import { px } from "../../utils/platform.web";

type WebProps = CardSectionProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    className?: string;
  };

export function CardFooter({
  children,
  padding = "md",
  divider = true,
  className = "",
  style,
  ...props
}: WebProps) {
  const pad = cardTokens.section.padding[padding];

  const baseStyle: React.CSSProperties = {
    padding: px(pad),
    borderTop: divider ? "1px solid var(--ui-border)" : "none",
  };

  return (
    <div {...props} className={className} style={{ ...baseStyle, ...(style as any) }}>
      {children}
    </div>
  );
}
