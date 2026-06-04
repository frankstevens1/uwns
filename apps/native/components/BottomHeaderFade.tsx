import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StyleSheet, View } from "react-native";

type BottomHeaderFadeProps = {
  backgroundColor: string;
  bottomOffset: number;
  height?: number;
};

export function BottomHeaderFade({
  backgroundColor,
  bottomOffset,
  height = 56,
}: BottomHeaderFadeProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.root,
        {
          bottom: bottomOffset,
          height,
        },
      ]}
    >
      <Svg height="100%" width="100%">
        <Defs>
          <LinearGradient id="bottom-header-fade" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={backgroundColor} stopOpacity="0" />
            <Stop offset="1" stopColor={backgroundColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect fill="url(#bottom-header-fade)" height="100%" width="100%" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 1,
  },
});
