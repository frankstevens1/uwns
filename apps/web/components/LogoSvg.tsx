import * as React from "react";

export type LogoUwnsProps = React.SVGProps<SVGSVGElement> & {
  text?: string;
  iconOnly?: boolean;
};

export function LogoUwns({
  text = "UWNS",
  iconOnly = false,
  ...props
}: LogoUwnsProps) {
  const ICON_W = 40;
  const GAP = 12;
  const WORD_X = ICON_W + GAP;
  const VB_W = iconOnly ? 52 : 220;

  return (
    <svg
      viewBox={`0 0 ${VB_W} 64`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={text}
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      {/* === ICON === */}
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 1)"
      >
        {/* Outer U */}
        <path
          d="M12 14 V40 C12 48 18 54 26 54 C34 54 40 48 40 40 V14"
          strokeWidth="4.2"
        />

        {/* Inner U */}
        <path
          d="M18 18 V39 C18 44 22 48 26 48 C30 48 34 44 34 39 V18"
          strokeWidth="2.6"
          opacity="0.7"
        />
      </g>

      {!iconOnly && (
        <text
          x={WORD_X}
          y="48"
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fontWeight="800"
          fontSize="34"
          letterSpacing="-0.8"
        >
          {text}
        </text>
      )}
    </svg>
  );
}
