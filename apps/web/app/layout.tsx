import "../styles/globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Shell } from "@/components/Shell";
import { ThemeStyle } from "@/components/theme-style";

export const metadata: Metadata = {
  title: "df",
  description: "df web app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeStyle />
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
