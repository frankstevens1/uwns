export const APP_TOP_BAR_HEIGHT = 36;
export const APP_TOP_BAR_CONTENT_GAP = 14;

export function getTabScreenTopPadding(topInset: number) {
  return topInset + APP_TOP_BAR_HEIGHT + APP_TOP_BAR_CONTENT_GAP;
}
