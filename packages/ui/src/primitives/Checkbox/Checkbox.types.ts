export type CheckboxProps = {
  label?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;

  className?: string; // web escape hatch
  style?: any;
};
