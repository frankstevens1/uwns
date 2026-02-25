import { baseTokens as tokens } from "../theme";

export const inputTokens = {
  base: {
    height: { sm: 28, md: 34 },
    radius: tokens.radius.md,
    borderWidth: 1,
    paddingX: 10,
    fontSize: tokens.fontSize.sm,
  },
  colors: {
    bg: tokens.color.bg,
    fg: tokens.color.fg,
    placeholder: tokens.color.mutedFg,
    border: tokens.color.border,
    borderFocus: tokens.color.border,
    borderError: tokens.color.dangerBorder,
  },
} as const;
