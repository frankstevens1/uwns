export type ThemeTokens = {
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  space: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
  fontSize: {
    sm: number;
    md: number;
    lg: number;
  };
  fontWeight: {
    medium: string;
    semibold: string;
  };
  color: {
    bg: string;
    fg: string;
    border: string;

    primaryBg: string;
    primaryFg: string;
    primaryHoverBg: string;
    successFg: string;
    dangerFg: string;
    warningFg: string;
    infoFg: string;

    subtleBg: string;
    mutedFg: string;

    disabledBg: string;
    disabledFg: string;

    successBorder: string;
    dangerBorder: string;
    warningBorder: string;
    infoBorder: string;
  };
  opacity: {
    disabled: number;
  };
};

export const baseTokens: ThemeTokens = {
  radius: { sm: 4, md: 6, lg: 8 },
  space: { 1: 3, 2: 6, 3: 10, 4: 14 },
  fontSize: { sm: 12, md: 14, lg: 16 },
  fontWeight: { medium: "500", semibold: "600" },

  // Base values are “light-ish”; overrides below define actual schemes.
  color: {
    bg: "#ffffff",
    fg: "#0a0a0a",
    border: "rgba(0,0,0,0.28)",

    primaryBg: "#0a0a0a",
    primaryFg: "#ffffff",
    primaryHoverBg: "rgba(0,0,0,0.86)",
    successFg: "#107c10",
    dangerFg: "#dc2626",
    warningFg: "#f59e0b",
    infoFg: "#0a0a0a",

    subtleBg: "rgba(0,0,0,0.03)",
    mutedFg: "rgba(0,0,0,0.7)",

    disabledBg: "rgba(0,0,0,0.1)",
    disabledFg: "rgba(0,0,0,0.5)",

    successBorder: "rgba(16,185,129,0.6)",
    dangerBorder: "rgba(220,38,38,0.6)",
    warningBorder: "rgba(245,158,11,0.6)",
    infoBorder: "rgba(0,0,0,0.28)",
  },

  opacity: { disabled: 0.5 },
} as const;

export const lightTokens: ThemeTokens = {
  ...baseTokens,
  color: {
    ...baseTokens.color,
    bg: "#ffffff",
    fg: "#0a0a0a",
    border: "rgba(0,0,0,0.28)",
    primaryBg: "#0a0a0a",
    primaryFg: "#ffffff",
    primaryHoverBg: "rgba(0,0,0,0.86)",
    successFg: "#107c10",
    dangerFg: "#dc2626",
    warningFg: "#f59e0b",
    infoFg: "#0a0a0a",
    subtleBg: "rgba(0,0,0,0.03)",
    mutedFg: "rgba(0,0,0,0.7)",
    disabledBg: "rgba(0,0,0,0.1)",
    disabledFg: "rgba(0,0,0,0.5)",
    successBorder: "rgba(16,185,129,0.6)",
    dangerBorder: "rgba(220,38,38,0.6)",
    warningBorder: "rgba(245,158,11,0.6)",
    infoBorder: "rgba(0,0,0,0.28)",
  },
} as const;

export const darkTokens: ThemeTokens = {
  ...baseTokens,
  color: {
    ...baseTokens.color,
    bg: "#0b0b0c",
    fg: "#f3f3f4",
    border: "rgba(255,255,255,0.22)",
    primaryBg: "#f3f3f4",
    primaryFg: "#0b0b0c",
    primaryHoverBg: "rgba(255,255,255,0.86)",
    successFg: "#4ade80",
    dangerFg: "#f87171",
    warningFg: "#fbbf24",
    infoFg: "#f3f3f4",
    subtleBg: "rgba(255,255,255,0.07)",
    mutedFg: "rgba(255,255,255,0.7)",
    disabledBg: "rgba(255,255,255,0.14)",
    disabledFg: "rgba(255,255,255,0.5)",
    successBorder: "rgba(74,222,128,0.6)",
    dangerBorder: "rgba(248,113,113,0.6)",
    warningBorder: "rgba(251,191,36,0.6)",
    infoBorder: "rgba(255,255,255,0.22)",
  },
} as const;
