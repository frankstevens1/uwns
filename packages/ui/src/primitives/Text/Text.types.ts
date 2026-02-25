export type TextTone = "default" | "muted" | "danger" | "success";

export type TextVariant =
  | "body"
  | "label"
  | "hint"
  | "error"
  | "title";

export type TextProps = {
  children?: any;
  tone?: TextTone;
  variant?: TextVariant;
  align?: "left" | "center" | "right";
  numberOfLines?: number;

  // web-only escape hatch
  className?: string;
  style?: any;
};
