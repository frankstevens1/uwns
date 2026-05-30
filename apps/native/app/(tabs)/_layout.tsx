import * as React from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@repo/providers";
import { useThemeTokens } from "@repo/ui";

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const tokens = useThemeTokens();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user]);

  if (loading) return null;
  if (!user) return null;

  return (
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
