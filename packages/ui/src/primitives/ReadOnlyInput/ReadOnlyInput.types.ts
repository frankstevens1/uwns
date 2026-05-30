export type ReadOnlyInputSize = "sm" | "md";

export type ReadOnlyInputProps = {
  label: string;
  value?: string | null;
  loading?: boolean;
  placeholder?: string;
  copyable?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  size?: ReadOnlyInputSize;
};
