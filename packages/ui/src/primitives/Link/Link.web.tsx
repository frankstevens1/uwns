import * as React from "react";
import type { LinkProps } from "./Link.types";
import { labelTokens } from "../../theme";
import { px } from "../../utils/platform.web";

type WebProps = LinkProps &
  Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "onClick" | "children"
  > & {
    className?: string;
    style?: React.CSSProperties;
  };

export function Link({
  children,
  href,
  onPress,
  disabled,
  size = "md",
  tone = "default",
  className = "",
  style,
  ...props
}: WebProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (!href) {
      e.preventDefault();
    }
    onPress?.();
  };

  // If no href is provided, keep it keyboard-accessible and prevent navigation.
  const finalHref = href ?? "#";

  const [hover, setHover] = React.useState(false);
  const baseColor = tone === "muted" ? "var(--ui-muted-fg)" : "var(--ui-fg)";
  return (
    <a
      {...props}
      href={finalHref}
      onClick={handleClick}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      className={className}
      style={{
        color: baseColor,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : hover ? 0.72 : 1,
        fontSize: size === "sm" ? px(labelTokens.fontSize) : undefined,
        fontWeight: size === "sm" ? (labelTokens.fontWeight as any) : undefined,
        textDecoration: "none",
        transition: "color 140ms ease, opacity 140ms ease",
        ...style,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </a>
  );
}
