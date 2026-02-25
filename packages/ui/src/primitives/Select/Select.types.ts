export type SelectOption = { label: string; value: string };
export type SelectSize = "sm" | "md";

export type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  search?: boolean;
  size?: SelectSize;

  className?: string; // web escape hatch
  style?: any;
};
