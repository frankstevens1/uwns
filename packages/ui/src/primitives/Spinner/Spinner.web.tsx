import type { SpinnerProps } from "./Spinner.types";

export function Spinner({ size = "md" }: SpinnerProps) {
  const px = size === "sm" ? 14 : 18;

  return (
    <span
      aria-label="Loading"
      style={{
        width: px,
        height: px,
        display: "inline-block",
        borderRadius: "9999px",
        border: "2px solid var(--ui-border)",
        borderTopColor: "var(--ui-fg)",
        animation: "ui-spin 700ms linear infinite",
      }}
    />
  );
}

// Inject keyframes once (ultra minimal, no CSS pipeline)
if (typeof document !== "undefined" && !document.getElementById("ui-spinner-style")) {
  const style = document.createElement("style");
  style.id = "ui-spinner-style";
  style.innerHTML = `@keyframes ui-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`;
  document.head.appendChild(style);
}
