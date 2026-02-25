export type TextareaProps = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number; // web
  numberOfLines?: number; // native

  className?: string;
  style?: any;
};
