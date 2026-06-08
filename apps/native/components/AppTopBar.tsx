import * as React from "react";
import {
  Alert,
  Animated,
  Linking,
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActions, useAuth, useNotifications } from "@repo/providers";
import {
  docsSearchIndex,
  resolveDocsUrl,
  resolveNotificationTarget,
} from "@repo/lib";
import { useThemeTokens } from "@repo/ui";
import { AppBottomTray, AppModal } from "./AppModal";
import {
  NotificationListItem,
  canManuallyMarkRead,
} from "./Notifications/NotificationListItem";
import { APP_TOP_BAR_HEIGHT } from "../constants/layout";

type CommandItem = {
  id: string;
  label: string;
  href?: "/(tabs)" | "/account" | "/settings";
  externalHref?: string;
  action?: () => void | Promise<void>;
  keywords?: string[];
  icon: keyof typeof Ionicons.glyphMap;
  meta?: string;
};

type CommandSection = {
  heading: string;
  items: CommandItem[];
  emptyText?: string;
};

type AppTopBarScrollContextValue = {
  scrollY: Animated.Value;
  onScroll: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
  setScrollOffset: (offset: number) => void;
};

const AppTopBarScrollContext =
  React.createContext<AppTopBarScrollContextValue | null>(null);

const DOCS_WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "";

export function AppTopBarProvider({ children }: { children: React.ReactNode }) {
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const onScroll = React.useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false },
      ),
    [scrollY],
  );
  const setScrollOffset = React.useCallback(
    (offset: number) => {
      scrollY.setValue(offset);
    },
    [scrollY],
  );

  return (
    <AppTopBarScrollContext.Provider
      value={{ scrollY, onScroll, setScrollOffset }}
    >
      {children}
    </AppTopBarScrollContext.Provider>
  );
}

export function useAppTopBarScroll() {
  const context = React.useContext(AppTopBarScrollContext);
  if (!context) {
    throw new Error("useAppTopBarScroll must be used within AppTopBarProvider.");
  }
  return context;
}

export function UserAvatar({
  size = 28,
  borderColor,
}: {
  size?: number;
  borderColor?: string;
}) {
  const tokens = useThemeTokens();
  const { user } = useAuth();
  const avatarSeed = encodeURIComponent(user?.id ?? "user");
  const avatarUrl = `https://api.dicebear.com/10.x/glyphs/svg?seed=${avatarSeed}`;

  return (
    <Image
      source={{ uri: avatarUrl }}
      accessibilityLabel="Account"
      style={[
        styles.userAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: borderColor ?? tokens.color.border,
          backgroundColor: tokens.color.subtleBg,
        },
      ]}
    />
  );
}

export function AppTopBar() {
  const insets = useSafeAreaInsets();
  const tokens = useThemeTokens();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { trackAction } = useActions();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const { scrollY } = useAppTopBarScroll();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const searchInputRef = React.useRef<TextInput | null>(null);

  const title = pathname.includes("account")
    ? "Account"
    : pathname.includes("settings")
      ? "Settings"
      : "Home";
  const titleOpacity = scrollY.interpolate({
    inputRange: [18, 56],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const borderOpacity = scrollY.interpolate({
    inputRange: [0, 48],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const sections = React.useMemo<CommandSection[]>(() => {
    const navigate: CommandItem[] = [
      {
        id: "home",
        label: "Home",
        href: "/(tabs)",
        icon: "home-outline",
        keywords: ["product", "overview", "actions"],
        meta: "Tab",
      },
      {
        id: "account",
        label: "Account",
        href: "/account",
        icon: "person-circle-outline",
        keywords: ["user", "profile", "identity", "settings"],
        meta: "Tab",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        icon: "settings-outline",
        keywords: [
          "preferences",
          "notifications",
          "push",
          "email",
          "actions",
        ],
        meta: "Tab",
      },
    ];

    const actions: CommandItem[] = [
      {
        id: "logout",
        label: "Sign out",
        icon: "log-out-outline",
        keywords: ["logout", "sign out"],
        meta: "Action",
        action: async () => {
          await trackAction({
            actionName: "signed_out",
            metadata: { trigger: "native_search_command" },
          });
          await signOut();
          router.replace("/login");
        },
      },
    ];

    const docs: CommandItem[] = docsSearchIndex.map((item) => {
      const externalHref = resolveDocsUrl(item.href, DOCS_WEB_BASE_URL);

      return {
        id: `docs:${item.href}`,
        label: item.title,
        externalHref: externalHref ?? undefined,
        icon: item.type === "page" ? "book-outline" : "document-text-outline",
        keywords: [item.href, item.section, item.description, item.searchText],
        meta: item.href,
        action: externalHref
          ? undefined
          : () => {
              Alert.alert(
                "Docs unavailable",
                "Set EXPO_PUBLIC_WEB_URL to open docs from native.",
              );
            },
      };
    });

    return [
      {
        heading: "Recent",
        items: [],
        emptyText: "No recent items yet.",
      },
      { heading: "Navigate", items: navigate },
      {
        heading: "Actions",
        items: user && !loading ? actions : [],
        emptyText:
          user && !loading ? "No actions available." : "Sign in to access actions.",
      },
      { heading: "Docs", items: docs },
    ];
  }, [loading, signOut, trackAction, user]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: normalizedQuery
        ? section.items.filter((item) =>
            [
              item.label,
              item.href ?? "",
              item.externalHref ?? "",
              item.meta ?? "",
              ...(item.keywords ?? []),
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery),
          )
        : section.items,
    }))
    .filter((section) => section.items.length > 0 || section.emptyText);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardOpen(true);
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOpen(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const searchResultsMaxHeight = keyboardOpen
    ? Math.max(
        260,
        Dimensions.get("window").height -
          keyboardHeight -
          insets.top -
          APP_TOP_BAR_HEIGHT -
          90,
      )
    : 360;
  const unreadNotifications = notifications.filter((item) => !item.read_at);
  const hasManualUnread = unreadNotifications.some(canManuallyMarkRead);

  async function runCommand(item: CommandItem) {
    setSearchOpen(false);
    setSearchQuery("");
    if (item.href) {
      router.navigate(item.href);
      return;
    }
    if (item.externalHref) {
      try {
        await Linking.openURL(item.externalHref);
      } catch {
        Alert.alert("Docs unavailable", "Could not open the docs link.");
      }
      return;
    }
    await item.action?.();
  }

  return (
    <>
      <View
        style={[
          styles.root,
          {
            height: insets.top + APP_TOP_BAR_HEIGHT,
            paddingTop: insets.top,
            paddingHorizontal: 16,
            backgroundColor: tokens.color.bg,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bottomBorder,
            {
              borderColor: tokens.color.border,
              opacity: borderOpacity,
            },
          ]}
        />

        <View style={styles.bar}>
          <TopBarIconButton
            label="Open search"
            icon="search-outline"
            onPress={() => setSearchOpen(true)}
          />

          <Animated.Text
            numberOfLines={1}
            style={[
              styles.headerTitle,
              { color: tokens.color.fg, opacity: titleOpacity },
            ]}
          >
            {title}
          </Animated.Text>

          <View>
            <TopBarIconButton
              label="Open notifications"
              icon="notifications-outline"
              onPress={() => setNotificationsOpen(true)}
            />
            {unreadCount > 0 ? (
              <View
                pointerEvents="none"
                style={[
                  styles.unreadBadge,
                  { backgroundColor: tokens.color.primaryBg },
                ]}
              >
                <Text
                  style={[
                    styles.unreadBadgeText,
                    { color: tokens.color.primaryFg },
                  ]}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <AppModal
        visible={searchOpen}
        onOpenChange={setSearchOpen}
        contentFrameStyle={[
          styles.searchFrame,
          keyboardOpen
            ? [
                styles.searchFrameKeyboardOpen,
                { paddingTop: insets.top + 12 },
              ]
            : styles.searchFrameCentered,
        ]}
      >
          <View
            style={[
              styles.searchDialog,
              {
                backgroundColor: tokens.color.bg,
                borderColor: tokens.color.border,
                borderRadius: tokens.radius.lg,
              },
            ]}
          >
            <Pressable
              onPress={() => searchInputRef.current?.focus()}
              accessibilityRole="button"
              accessibilityLabel="Focus search input"
              style={[
                styles.searchInputRow,
                {
                  backgroundColor: tokens.color.subtleBg,
                  borderColor: tokens.color.border,
                  borderRadius: tokens.radius.md,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                color={tokens.color.mutedFg}
                size={18}
              />
              <TextInput
                ref={searchInputRef}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
                placeholderTextColor={tokens.color.mutedFg}
                returnKeyType="search"
                showSoftInputOnFocus
                style={[styles.searchInput, { color: tokens.color.fg }]}
              />
            </Pressable>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={[
                styles.searchResults,
                {
                  maxHeight: searchResultsMaxHeight,
                },
              ]}
            >
              {filteredSections.length > 0 ? (
                filteredSections.map((section) => (
                  <View key={section.heading} style={styles.commandSection}>
                    <Text
                      style={[
                        styles.commandHeading,
                        { color: tokens.color.mutedFg },
                      ]}
                    >
                      {section.heading}
                    </Text>
                    {section.items.length > 0 ? (
                      section.items.map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={() => void runCommand(item)}
                          accessibilityRole="button"
                          style={({ pressed }) => [
                            styles.searchResult,
                            {
                              backgroundColor: pressed
                                ? tokens.color.subtleBg
                                : "transparent",
                              borderRadius: tokens.radius.md,
                            },
                          ]}
                        >
                          <View style={styles.resultLabel}>
                            <Ionicons
                              name={item.icon}
                              color={tokens.color.mutedFg}
                              size={16}
                            />
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.resultTitle,
                                { color: tokens.color.fg },
                              ]}
                            >
                              {item.label}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.resultMeta,
                              { color: tokens.color.mutedFg },
                            ]}
                            numberOfLines={1}
                          >
                            {item.href ?? item.meta ?? "Action"}
                          </Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text
                        style={[
                          styles.emptySectionText,
                          { color: tokens.color.mutedFg },
                        ]}
                      >
                        {section.emptyText}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: tokens.color.mutedFg }]}>
                  No results.
                </Text>
              )}
            </ScrollView>
            <Text style={[styles.commandHint, { color: tokens.color.mutedFg }]}>
              Type to filter, tap to run.
            </Text>
          </View>
      </AppModal>

      <AppBottomTray
        visible={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        trayStyle={[
          styles.tray,
          {
            paddingBottom: insets.bottom + 20,
            backgroundColor: tokens.color.bg,
            borderColor: tokens.color.border,
            borderTopLeftRadius: tokens.radius.lg,
            borderTopRightRadius: tokens.radius.lg,
          },
        ]}
      >
        <View style={styles.trayHeader}>
          <View>
            <Text style={[styles.trayTitle, { color: tokens.color.fg }]}>
              Notifications
            </Text>
            <Text style={[styles.traySubtitle, { color: tokens.color.mutedFg }]}>
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up."}
            </Text>
          </View>
          <View style={styles.trayActions}>
            <Pressable
              onPress={() => {
                setNotificationsOpen(false);
                router.navigate("/notifications");
              }}
              accessibilityRole="button"
              accessibilityLabel="View all notifications"
              style={({ pressed }) => [
                styles.markAllButton,
                {
                  borderColor: tokens.color.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Text style={[styles.markAllText, { color: tokens.color.fg }]}>
                View all
              </Text>
            </Pressable>
            {hasManualUnread ? (
              <Pressable
                onPress={() => {
                  void trackAction({
                    actionName: "notifications_mark_all_read_clicked",
                    metadata: {
                      source: "header_tray",
                      screen: "notifications",
                      trigger: "button",
                      unreadCount: unreadNotifications.length,
                    },
                  });
                  void markAllAsRead();
                }}
                accessibilityRole="button"
                accessibilityLabel="Mark all notifications read"
                style={({ pressed }) => [
                  styles.markAllButton,
                  {
                    borderColor: tokens.color.border,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Text style={[styles.markAllText, { color: tokens.color.fg }]}>
                  Mark all read
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.notificationList}>
          {notificationsLoading ? (
            <Text style={[styles.emptyText, { color: tokens.color.mutedFg }]}>
              Loading notifications...
            </Text>
          ) : notificationsError ? (
            <Text style={[styles.emptyText, { color: tokens.color.mutedFg }]}>
              Notifications are unavailable.
            </Text>
          ) : unreadNotifications.length === 0 ? (
            <Text style={[styles.emptyText, { color: tokens.color.mutedFg }]}>
              No unread notifications.
            </Text>
          ) : (
            unreadNotifications.slice(0, 8).map((item) => (
              <NotificationListItem
                key={item.id}
                notification={item}
                trackingSource="native_header_tray"
                onPress={() => {
                  if (canManuallyMarkRead(item)) {
                    void markAsRead(item.id);
                  }
                  const resolvedTarget = resolveNotificationTarget(
                    item.target,
                    "native",
                  );
                  if (!resolvedTarget) return;

                  setNotificationsOpen(false);
                  if (resolvedTarget.type === "external_url") {
                    void Linking.openURL(resolvedTarget.href);
                    return;
                  }
                  router.navigate(resolvedTarget.href as any);
                }}
                onMarkAsRead={() => markAsRead(item.id)}
              />
            ))
          )}
        </View>
      </AppBottomTray>
    </>
  );
}

function TopBarIconButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const tokens = useThemeTokens();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconButton,
        {
          borderRadius: tokens.radius.md,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Ionicons name={icon} color={tokens.color.fg} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  bar: {
    height: APP_TOP_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomBorder: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    position: "absolute",
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  userAvatar: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchFrame: {
    padding: 16,
  },
  searchFrameCentered: {
    justifyContent: "center",
  },
  searchFrameKeyboardOpen: {
    justifyContent: "flex-start",
  },
  searchDialog: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  searchInputRow: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  searchResults: {
    paddingTop: 8,
    gap: 2,
  },
  commandSection: {
    paddingTop: 4,
  },
  commandHeading: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  searchResult: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  resultLabel: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  resultMeta: {
    maxWidth: "42%",
    flexShrink: 0,
    fontSize: 12,
  },
  emptySectionText: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  emptyText: {
    paddingHorizontal: 10,
    paddingVertical: 16,
    fontSize: 14,
  },
  commandHint: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 2,
    fontSize: 12,
  },
  tray: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  trayHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  trayActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  markAllButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "700",
  },
  trayTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  traySubtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  notificationList: {
    paddingTop: 18,
    gap: 10,
  },
});
