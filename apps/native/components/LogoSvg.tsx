import * as React from "react";
import Svg, { G, Text as SvgText } from "react-native-svg";

export type LogoSvgNativeProps = {
  text?: string;
  primaryChars?: number;

  /** Native needs an explicit color (use theme tokens) */
  color?: string;

  /** Size controls */
  width?: number;
  height?: number;

  skewDeg?: number;
  variant?: "outlined" | "solid";

  /** Accessibility */
  accessibilityLabel?: string;
};

export const LogoSvg: React.FC<LogoSvgNativeProps> = ({
  text = "UWNS",
  primaryChars = 2,
  color = "#0a0a0a",
  width = 88,
  height = 48,
  skewDeg = -8,
  variant = "outlined",
  accessibilityLabel,
}) => {
  const primary = text.slice(0, primaryChars);
  const suffix = text.slice(primaryChars);

  const strokeWidthPrimary = variant === "outlined" ? 6 : 0;
  const strokeWidthSuffix = variant === "outlined" ? 2 : 0;

  const primaryLetterSpacing =
    primary.length === 2 ? (primary.toLowerCase() === "df" ? -61 : -42) : -10;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 220 120"
      accessible
      accessibilityLabel={accessibilityLabel ?? `${text} logo`}
    >
      <G transform={`skewX(${skewDeg})`}>
        <SvgText
          x="52%"
          y="56%"
          fill={color}
          stroke={color}
          strokeWidth={strokeWidthPrimary}
          fontFamily="FiraCode-Bold"
          // If you don’t have FiraCode bundled, pick a safe fallback:
          // fontFamily={Platform.select({ ios: "Menlo-Bold", android: "monospace" })}
          fontSize="88"
          fontWeight="700"
          letterSpacing={primaryLetterSpacing}
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {primary}
        </SvgText>

        {!!suffix && (
          <SvgText
            x="83%"
            y="78%"
            fill={color}
            stroke={color}
            strokeWidth={strokeWidthSuffix}
            fontFamily="FiraCode-Bold"
            fontSize="44"
            fontWeight="700"
            letterSpacing={-18}
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {suffix}
          </SvgText>
        )}
      </G>
    </Svg>
  );
};

export default LogoSvg;
