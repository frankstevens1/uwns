import type { LabelProps } from "./Label.types";
import { labelTokens } from "../../theme";
import { px } from "../../utils/platform.web";

export function Label({ children, htmlFor }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: px(labelTokens.fontSize),
        fontWeight: labelTokens.fontWeight as any,
        color: "var(--ui-muted-fg)",
      }}
    >
      {children}
    </label>
  );
}
