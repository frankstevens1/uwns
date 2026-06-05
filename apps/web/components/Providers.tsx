"use client";

import * as React from "react";
import {
  ActionProvider,
  AuthProvider,
  NotificationsProvider,
} from "@repo/providers";
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
        <NotificationsProvider>
          <ActionProvider>
            {children}
            <Toaster position="bottom-center" />
          </ActionProvider>
        </NotificationsProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}
