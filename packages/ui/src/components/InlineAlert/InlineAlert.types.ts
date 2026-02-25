export type InlineAlertTone = "info" | "success" | "warning" | "error";

export type InlineAlertProps = {
  tone?: InlineAlertTone;
  title?: string;
  message?: string;
  children?: any;

  className?: string;
  style?: any;
};
