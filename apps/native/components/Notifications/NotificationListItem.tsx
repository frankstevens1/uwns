import * as React from "react";
import { Ionicons } from "@expo/vector-icons";
import type { Notification } from "@repo/lib";
import {
  getKeyedBadgeColors,
  useThemeTokens,
  type BadgeColorStyle,
} from "@repo/ui";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SWIPE_ACTION_WIDTH = 96;
const SWIPE_OPEN_THRESHOLD = 0.45;

const notificationGroupLabels: Record<string, string> = {
  auth: "Authentication",
  account: "Account",
  system: "System",
};

export type NotificationListItemProps = {
  notification: Notification;
  onPress: () => void;
  onMarkAsRead: () => void | Promise<void>;
};

export function canManuallyMarkRead(notification: Notification) {
  return (
    !notification.read_at &&
    notification.metadata.autoReadOnly !== true &&
    notification.type !== "login_platform_prompt"
  );
}

export function getNativeNotificationHref(notification: Notification) {
  const nativeHref = notification.metadata.nativeHref;
  if (typeof nativeHref === "string") return nativeHref;
  if (notification.href === "/app/account") return "/account";
  return notification.href;
}

export function NotificationListItem({
  notification,
  onPress,
  onMarkAsRead,
}: NotificationListItemProps) {
  const tokens = useThemeTokens();
  const translateX = React.useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = React.useState(0);
  const dragStartXRef = React.useRef(0);
  const isOpenRef = React.useRef(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  const canSwipe = canManuallyMarkRead(notification);
  const metaLabel = getNotificationMetaLabel(notification);
  const groupLabel = getNotificationGroupLabel(notification.group_key);
  const groupColors = getKeyedBadgeColors(notification.group_key);

  React.useEffect(() => {
    if (!canSwipe) {
      isOpenRef.current = false;
      setIsOpen(false);
      translateX.setValue(0);
    }
  }, [canSwipe, notification.id, translateX]);

  const animateTo = React.useCallback(
    (value: number) => {
      isOpenRef.current = value < 0;
      setIsOpen(value < 0);
      Animated.spring(translateX, {
        toValue: value,
        useNativeDriver: true,
        damping: 22,
        stiffness: 260,
      }).start();
    },
    [translateX],
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          canSwipe &&
          Math.abs(gestureState.dx) > 8 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          canSwipe &&
          Math.abs(gestureState.dx) > 8 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          setDragging(true);
          translateX.stopAnimation((value) => {
            dragStartXRef.current = value;
            isOpenRef.current = value <= -SWIPE_ACTION_WIDTH / 2;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const nextValue = clamp(
            dragStartXRef.current + gestureState.dx,
            -SWIPE_ACTION_WIDTH,
            0,
          );
          translateX.setValue(nextValue);
        },
        onPanResponderRelease: (_, gestureState) => {
          const currentValue = dragStartXRef.current + gestureState.dx;
          const shouldOpen =
            currentValue < -SWIPE_ACTION_WIDTH * SWIPE_OPEN_THRESHOLD ||
            gestureState.vx < -0.35;
          setDragging(false);
          animateTo(shouldOpen ? -SWIPE_ACTION_WIDTH : 0);
        },
        onPanResponderTerminate: () => {
          setDragging(false);
          animateTo(isOpenRef.current ? -SWIPE_ACTION_WIDTH : 0);
        },
      }),
    [animateTo, canSwipe, translateX],
  );

  function handlePress() {
    if (isOpenRef.current) {
      animateTo(0);
      return;
    }

    onPress();
  }

  function handleMarkAsRead() {
    animateTo(0);
    void onMarkAsRead();
  }

  return (
    <View
      onLayout={(event) => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
      style={[
        styles.root,
        {
          backgroundColor: tokens.color.subtleBg,
          borderColor: tokens.color.border,
          borderRadius: tokens.radius.md,
        },
      ]}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.row,
          {
            width:
              canSwipe && containerWidth > 0
                ? containerWidth + SWIPE_ACTION_WIDTH
                : "100%",
          },
          { transform: [{ translateX }] },
        ]}
      >
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityHint={
            canSwipe ? "Swipe left to reveal Mark read." : undefined
          }
          style={({ pressed }) => [
            styles.content,
            {
              backgroundColor: tokens.color.subtleBg,
              width: containerWidth > 0 ? containerWidth : "100%",
            },
            {
              opacity: pressed && !dragging ? 0.82 : 1,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <View style={styles.titleContent}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: notification.read_at
                      ? tokens.color.border
                      : tokens.color.fg,
                  },
                ]}
              />
              <Text style={[styles.title, { color: tokens.color.fg }]}>
                {notification.title}
              </Text>
            </View>
          </View>
          <Text style={[styles.body, { color: tokens.color.mutedFg }]}>
            {notification.body}
          </Text>
          <View style={styles.metaRow}>
            <GroupBadge colors={groupColors}>{groupLabel}</GroupBadge>
            <Text
              numberOfLines={1}
              style={[styles.meta, { color: tokens.color.mutedFg }]}
            >
              {metaLabel}
            </Text>
          </View>

          {canSwipe ? (
            <View pointerEvents="none" style={styles.chevronContainer}>
              <Ionicons
                name={isOpen ? "chevron-forward" : "chevron-back"}
                color={tokens.color.mutedFg}
                size={14}
                style={styles.chevron}
              />
            </View>
          ) : null}
        </Pressable>

        {canSwipe ? (
          <Pressable
            onPress={handleMarkAsRead}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${notification.title} read`}
            style={[
              styles.action,
              { backgroundColor: tokens.color.primaryBg },
            ]}
          >
            <Ionicons
              name="checkmark"
              color={tokens.color.primaryFg}
              size={16}
            />
            <Text
              numberOfLines={1}
              style={[styles.actionLabel, { color: tokens.color.primaryFg }]}
            >
              Mark read
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

function GroupBadge({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: BadgeColorStyle;
}) {
  return (
    <View
      style={[
        styles.groupBadge,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.groupBadgeText, { color: colors.color }]}
      >
        {children}
      </Text>
    </View>
  );
}

function getNotificationGroupLabel(groupKey: string) {
  return notificationGroupLabels[groupKey] ?? groupKey;
}

function getNotificationMetaLabel(notification: Notification) {
  if (!notification.read_at && !canManuallyMarkRead(notification)) {
    return "Complete action to mark read";
  }

  return formatNotificationTime(notification.created_at);
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  root: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    position: "relative",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  action: {
    width: SWIPE_ACTION_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 28,
    flex: 1,
    position: "relative",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "700",
  },
  chevron: {
    opacity: 0.65,
  },
  chevronContainer: {
    position: "absolute",
    top: 0,
    right: 10,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  groupBadge: {
    maxWidth: "55%",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  groupBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
  },
});
