export type SelectOption = { label: string; value: string; group?: string };
export type SelectSize = "sm" | "md";
export type SelectVariant = "default" | "ghost";

export type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  search?: boolean;
  size?: SelectSize;
  variant?: SelectVariant;

  className?: string; // web escape hatch
  style?: any;
};
