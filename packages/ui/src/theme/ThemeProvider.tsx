import * as React from "react";
import type { ThemeTokens } from "./theme";
import { lightTokens } from "./theme";

const ThemeTokensContext = React.createContext<ThemeTokens>(lightTokens);

export function ThemeProvider({
  tokens,
  children,
}: {
  tokens?: ThemeTokens;
  children: React.ReactNode;
}) {
  return (
    <ThemeTokensContext.Provider value={tokens ?? lightTokens}>
      {children}
    </ThemeTokensContext.Provider>
  );
}

export function useThemeTokens() {
  return React.useContext(ThemeTokensContext);
}
