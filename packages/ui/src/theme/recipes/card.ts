import { elevation } from "../platform";
import { baseTokens as tokens } from "../theme";

export type CardVariant = "default" | "subtle" | "outlined";
export type CardPadding = "none" | "sm" | "md";
export type CardRadius = "md" | "lg";
export type CardElevation = "none" | "sm";

export const cardTokens = {
  base: {
    borderWidth: 1,
  },

  radius: {
    md: tokens.radius.md,
    lg: tokens.radius.lg,
  },

  padding: {
    none: 0,
    sm: 10,
    md: 12,
  },

  variant: {
    default: {
      bg: tokens.color.bg,
      fg: tokens.color.fg,
      border: tokens.color.border,
    },
    subtle: {
      bg: "rgba(0,0,0,0.03)",
      fg: tokens.color.fg,
      border: "transparent",
    },
    outlined: {
      bg: "transparent",
      fg: tokens.color.fg,
      border: tokens.color.border,
    },
  },

  elevation: {
    none: elevation.none,
    sm: elevation.sm,
  },

  section: {
    padding: {
      none: 0,
      sm: 10,
      md: 12,
    },
    dividerColor: tokens.color.border,
  },
} as const;
