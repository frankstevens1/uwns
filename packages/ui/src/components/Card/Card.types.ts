import type * as React from "react";
import type { CardVariant, CardPadding, CardRadius, CardElevation } from "../../theme";

export type CardProps = {
  children?: React.ReactNode;

  variant?: CardVariant;
  padding?: CardPadding;
  radius?: CardRadius;
  elevation?: CardElevation;
};
