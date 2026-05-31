"use client";

import * as React from "react";
import { ActivityProvider, AuthProvider } from "@repo/providers";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/Sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <AuthProvider>
        <ActivityProvider>
          {children}
          <Toaster position="bottom-center" />
        </ActivityProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}
