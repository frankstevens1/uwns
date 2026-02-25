import * as React from "react";
import type { LinkProps } from "./Link.types";

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
  className = "",
  style,
  ...props
}: WebProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onPress?.();
  };

  // If no href is provided, keep it keyboard-accessible and prevent navigation.
  const finalHref = href ?? "#";

  // Inline hover effect for color swap
  const [hover, setHover] = React.useState(false);
  return (
    <a
      {...props}
      href={finalHref}
      onClick={handleClick}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      className={className}
      style={{
        color: hover ? "var(--ui-primary-fg)" : "var(--ui-fg)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        textDecoration: "underline",
        ...style,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </a>
  );
}
