## Branding the UI per app (token overrides)

Each app in the monorepo can **brand the shared UI independently** by overriding design tokens.
This allows multiple products to share the same UI package while maintaining different visual identities.

The UI package defines the **theme contract**.
Apps decide **values**.

---

### How it works (mental model)

* `@repo/ui` defines:

  * the token structure
  * default light / dark token presets
* Each app:

  * imports those presets
  * applies **partial overrides**
  * supplies the result to `ThemeProvider`

No app ever edits UI internals.

---

## Web app branding

### 1. Create an app theme file

Create:

```
apps/web/src/theme.ts
```

```ts
import {
  createThemeTokens,
  lightTokens,
  darkTokens,
  type Tokens,
} from "@repo/ui/theme";

/**
 * Web app branding
 * Override only what you need.
 */

export const webLightTokens: Tokens = createThemeTokens({
  color: {
    primaryBg: "#2563eb", // blue-600
    primaryFg: "#ffffff",

    bg: "#ffffff",
    fg: "#0f172a",        // slate-900
  },
});

export const webDarkTokens: Tokens = createThemeTokens({
  color: {
    primaryBg: "#93c5fd", // blue-300
    primaryFg: "#0f172a",

    bg: "#020617",       // slate-950
    fg: "#e5e7eb",       // gray-200
  },
});
```

Only override the tokens you care about — everything else falls back to UI defaults.

---

### 2. Expose tokens as CSS variables

The web app maps tokens → CSS variables once, at the root.

Create:

```
apps/web/app/theme-style.tsx
```

```tsx
"use client";

import { tokensToCssVars } from "@repo/ui/theme";
import { webLightTokens, webDarkTokens } from "@/theme";

export function ThemeStyle() {
  const light = tokensToCssVars(webLightTokens);
  const dark = tokensToCssVars(webDarkTokens);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
${light}

.dark {
${dark.replace(":root {", "").replace("}", "")}
}
        `,
      }}
    />
  );
}
```

---

### 3. Include it once in the root layout

Update:

```
apps/web/app/layout.tsx
```

```tsx
import "./globals.css";
import { Providers } from "./providers";
import { ThemeStyle } from "./theme-style";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeStyle />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

### 4. Dark mode switching

The web app controls dark mode by toggling a `.dark` class on `<html>`.

You can use:

* `next-themes`
* or your own `ThemeSwitcher`

UI components automatically react because they consume CSS variables.

---

## Native app branding

### 1. Create a native theme file

Create:

```
apps/native/src/theme.ts
```

```ts
import {
  createThemeTokens,
  lightTokens,
  darkTokens,
  type Tokens,
} from "@repo/ui/theme";

export const nativeLightTokens: Tokens = createThemeTokens({
  color: {
    primaryBg: "#16a34a", // green-600
    primaryFg: "#ffffff",
  },
});

export const nativeDarkTokens: Tokens = createThemeTokens({
  color: {
    primaryBg: "#86efac", // green-300
    primaryFg: "#022c22",
  },
});
```

---

### 2. Supply tokens via ThemeProvider

Update the Expo root layout:

```
apps/native/app/_layout.tsx
```

```tsx
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { AuthProvider } from "@repo/providers";
import { ThemeProvider } from "@repo/ui/theme";
import { nativeLightTokens, nativeDarkTokens } from "@/theme";

export default function RootLayout() {
  const scheme = useColorScheme();
  const tokens = scheme === "dark" ? nativeDarkTokens : nativeLightTokens;

  return (
    <AuthProvider>
      <ThemeProvider tokens={tokens}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </AuthProvider>
  );
}
```

Native components read tokens directly from context — no CSS, no class names.

---

## What can be overridden?

Apps may override **any token**, but common branding points are:

```ts
tokens.color.primaryBg
tokens.color.primaryFg
tokens.color.bg
tokens.color.fg
tokens.radius.lg
tokens.space
```

You generally **should not** override component recipes in apps unless you are intentionally diverging UX.

---

## Design rule of thumb

* **UI package** defines *structure and intent*
* **Apps** define *brand and tone*

If a change should affect **all apps**, it belongs in `@repo/ui`.
If a change is product-specific, it belongs in the app’s theme file.

---

## Why this scales

This approach:

* avoids forking the UI package
* keeps dark mode smooth and predictable
* allows multiple branded apps in one monorepo
* works for published UI packages later

No magic. No runtime styling engine. Just tokens + discipline.
