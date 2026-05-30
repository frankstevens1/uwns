export type CodeBlockProps = {
  theme?: "light" | "dark" | "none";
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
  style?: any;
};
