export type FormControlProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;

  children: any;

  className?: string; // web escape hatch
  style?: any;
};
