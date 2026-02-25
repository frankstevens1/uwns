export type {{ComponentName}}Props = {
  /**
   * Optional visual style variant.
   */
  variant?: "default";

  /**
   * Cross-platform press handler.
   * - Web maps this to `onClick`
   * - Native maps this to `onPress`
   */
  onPress?: () => void;

  children?: React.ReactNode;
};
