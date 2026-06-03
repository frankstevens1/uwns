import * as React from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@repo/providers";
import { useThemeTokens } from "@repo/ui";
import {
  AppTopBar,
  AppTopBarProvider,
  UserAvatar,
} from "../../components/AppTopBar";

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const tokens = useThemeTokens();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user]);

  if (loading) return null;
  if (!user) return null;

  return (
    <AppTopBarProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: tokens.color.fg,
          tabBarInactiveTintColor: tokens.color.mutedFg,
          tabBarIconStyle: { marginTop: 15 },
          tabBarItemStyle: { justifyContent: "center" },
          tabBarStyle: {
            backgroundColor: tokens.color.bg,
            borderTopColor: tokens.color.border,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <UserAvatar
                size={28}
                borderColor={focused ? color : "transparent"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
      <AppTopBar />
    </AppTopBarProvider>
  );
}
