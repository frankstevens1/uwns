import * as React from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type AppModalProps = {
  visible: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  contentFrameStyle?: StyleProp<ViewStyle>;
};

type AppBottomTrayProps = AppModalProps & {
  trayStyle?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const TRAY_FALLBACK_OFFSET = 420;
const MODAL_CLOSE_DURATION = 180;
const TRAY_CLOSE_DURATION = 180;

export function AppModal({
  visible,
  onOpenChange,
  children,
  contentFrameStyle,
}: AppModalProps) {
  const [mounted, setMounted] = React.useState(visible);
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration: MODAL_CLOSE_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [opacity, visible]);

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.root}>
        <AnimatedPressable
          style={[styles.backdrop, { opacity }]}
          onPress={() => onOpenChange(false)}
        />
        <View pointerEvents="box-none" style={[styles.content, contentFrameStyle]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function AppBottomTray({
  visible,
  onOpenChange,
  children,
  contentFrameStyle,
  trayStyle,
}: AppBottomTrayProps) {
  const translateY = React.useRef(new Animated.Value(TRAY_FALLBACK_OFFSET)).current;
  const dragOffsetRef = React.useRef(0);
  const trayHeightRef = React.useRef(TRAY_FALLBACK_OFFSET);
  const [dragging, setDragging] = React.useState(false);

  const getCloseOffset = React.useCallback(
    () => Math.max(trayHeightRef.current, TRAY_FALLBACK_OFFSET),
    [],
  );

  const getDismissThreshold = React.useCallback(() => {
    const closeOffset = getCloseOffset();
    return Math.min(Math.max(closeOffset * 0.22, 64), 120);
  }, [getCloseOffset]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 1 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          gestureState.dy > 1 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          setDragging(true);
          dragOffsetRef.current = 0;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextOffset = Math.max(0, gestureState.dy);
          dragOffsetRef.current = nextOffset;
          translateY.setValue(nextOffset);
        },
        onPanResponderRelease: (_, gestureState) => {
          setDragging(false);
          if (
            dragOffsetRef.current > getDismissThreshold() ||
            gestureState.vy > 0.35
          ) {
            onOpenChange(false);
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 22,
            stiffness: 260,
          }).start();
        },
        onPanResponderTerminate: () => {
          setDragging(false);
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 22,
            stiffness: 260,
          }).start();
        },
      }),
    [getDismissThreshold, onOpenChange, translateY],
  );

  React.useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : getCloseOffset(),
      duration: visible ? 220 : TRAY_CLOSE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [getCloseOffset, translateY, visible]);

  return (
    <AppModal
      visible={visible}
      onOpenChange={onOpenChange}
      contentFrameStyle={[styles.trayFrame, contentFrameStyle]}
    >
      <Animated.View
        style={[trayStyle, { transform: [{ translateY }] }]}
        onLayout={(event) => {
          trayHeightRef.current = Math.max(
            event.nativeEvent.layout.height,
            TRAY_FALLBACK_OFFSET,
          );
        }}
      >
        <Animated.View
          {...panResponder.panHandlers}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Drag down to close"
          accessibilityHint="Swipe down from this handle, or double tap to close."
          onAccessibilityTap={() => onOpenChange(false)}
          style={[
            styles.trayDragTarget,
            dragging ? styles.trayDragTargetActive : null,
          ]}
        >
          <View
            style={[
              styles.trayHandle,
              dragging ? styles.trayHandleActive : null,
            ]}
          />
        </Animated.View>
        {children}
      </Animated.View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  content: {
    ...StyleSheet.absoluteFillObject,
  },
  trayFrame: {
    justifyContent: "flex-end",
  },
  trayDragTarget: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -4,
    marginBottom: 4,
  },
  trayDragTargetActive: {
    opacity: 0.82,
  },
  trayHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(127,127,127,0.45)",
  },
  trayHandleActive: {
    width: 54,
    backgroundColor: "rgba(127,127,127,0.68)",
  },
});
