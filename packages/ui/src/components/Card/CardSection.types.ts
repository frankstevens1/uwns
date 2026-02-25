import type * as React from "react";
import type { CardPadding } from "../../theme";

export type CardSectionProps = {
  children?: React.ReactNode;

  /**
   * Section padding. Defaults to "md" for header/body/footer.
   */
  padding?: CardPadding;

  /**
   * Adds a divider line (header: bottom, footer: top).
   */
  divider?: boolean;
};
