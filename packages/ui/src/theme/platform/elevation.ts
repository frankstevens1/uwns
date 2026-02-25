export const elevation = {
  none: {
    webShadow: "none",
    ios: {
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
    android: { elevation: 0 },
  },
  sm: {
    webShadow: "0 1px 2px rgba(0,0,0,0.08)",
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 2 },
  },
} as const;
