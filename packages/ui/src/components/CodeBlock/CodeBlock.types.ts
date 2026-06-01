export type CodeBlockSnippet = {
  id: string;
  label: string;
  code: string;
  group?: string;
  language?: string;
  filename?: string;
};

export type CodeBlockProps = {
  theme?: "light" | "dark" | "none";
  code?: string;
  language?: string;
  filename?: string;
  snippets?: CodeBlockSnippet[];
  showLineNumbers?: boolean;
  copyable?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
  style?: any;
};
