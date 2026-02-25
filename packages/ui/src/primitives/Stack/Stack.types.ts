export type StackProps = {
  children?: any;
  direction?: "vertical" | "horizontal";
  gap?: number; // use raw number; callers can map from tokens if desired
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;

  // web-only escape hatches
  className?: string;
  style?: any;
};
