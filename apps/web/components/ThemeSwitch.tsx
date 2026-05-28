"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

type ThemeSwitcherProps = {
  inverse?: boolean;
};

export default function ThemeSwitcher({ inverse = false }: ThemeSwitcherProps) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div
        className="h-7 w-12 rounded-full"
        style={{
          background: "var(--ui-subtle-bg)",
          border: "1px solid var(--ui-border)",
          opacity: 0.7,
        }}
      />
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  // Sizing (tuned so nothing collides)
  const W = 48; // 12 * 4
  const H = 28; // 7 * 4
  const PAD = 2; // px
  const THUMB = 22; // px (slightly smaller than track height)
  const TRAVEL = W - PAD * 3.15 - THUMB; // px

  // Track colors
  const trackBg = inverse ? "var(--ui-bg)" : "var(--ui-subtle-bg)";
  const trackBorder = "var(--ui-border)";

  // Thumb colors (panel-ish surface)
  const thumbBg = "var(--ui-panel, var(--ui-bg))";
  const thumbBorder = "var(--ui-border)";

  // Icon colors – must stay visible:
  // Active icon: strong contrast, inactive: muted.
  const activeIcon = "var(--ui-fg)";
  const inactiveIcon = "var(--ui-muted-fg)";

  // Put icons near edges but safely away from thumb.
  const iconInset = 6; // px
  const iconSize = 14;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      role="switch"
      aria-checked={isDark}
      className="relative inline-flex select-none items-center rounded-full"
      style={{
        width: W,
        height: H,
        background: trackBg,
        border: `1px solid ${trackBorder}`,
        transition: "background-color 180ms ease, border-color 180ms ease",
      }}
    >
      {/* Left icon (sun) */}
      <span
        aria-hidden
        className="absolute"
        style={{
          left: iconInset,
          top: "50%",
          transform: "translateY(-50%)",
          color: isDark ? inactiveIcon : activeIcon,
          opacity: isDark ? 0.7 : 1,
          transition: "color 180ms ease, opacity 180ms ease",
          pointerEvents: "none",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Sun size={iconSize} />
      </span>

      {/* Right icon (moon) */}
      <span
        aria-hidden
        className="absolute"
        style={{
          right: iconInset,
          top: "50%",
          transform: "translateY(-50%)",
          color: isDark ? activeIcon : inactiveIcon,
          opacity: isDark ? 1 : 0.7,
          transition: "color 180ms ease, opacity 180ms ease",
          pointerEvents: "none",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Moon size={iconSize} />
      </span>

      {/* Thumb (single, centered, slides) */}
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{
          left: PAD,
          top: "50%",
          width: THUMB,
          height: THUMB,
          transform: `translate(${isDark ? TRAVEL : 0}px, -50%)`,
          background: thumbBg,
          border: `1px solid ${thumbBorder}`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
          transition:
            "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 180ms ease, border-color 180ms ease",
          pointerEvents: "none",
        }}
      />
    </button>
  );
}
