import { Platform } from "react-native";

export const isWeb = Platform.OS === "web"; // mostly false in native runtime

export function mergeNativeStyle<T>(...styles: (T | undefined | false)[]) {
  return styles;
}
