import { baseTokens as tokens } from "../theme";

export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export const buttonTokens = {
  base: {
    radius: tokens.radius.lg,
    borderWidth: 1,
    fontWeight: tokens.fontWeight.semibold,
  },
  size: {
    sm: { height: 28, paddingX: 10, fontSize: tokens.fontSize.sm },
    md: { height: 34, paddingX: 12, fontSize: tokens.fontSize.md },
    lg: { height: 40, paddingX: 16, fontSize: tokens.fontSize.lg },
  },
  variant: {
    primary: {
      bg: tokens.color.primaryBg,
      fg: tokens.color.primaryFg,
      border: "transparent",
      hoverBg: "rgba(0,0,0,0.92)",
      activeOpacity: 0.9,
    },
    ghost: {
      bg: "transparent",
      fg: tokens.color.fg,
      border: tokens.color.border,
      hoverBg: tokens.color.subtleBg,
      activeOpacity: 0.9,
    },
  },
} as const;
