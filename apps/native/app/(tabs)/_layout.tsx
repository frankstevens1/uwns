import * as React from "react";
import { Tabs, router } from "expo-router";
import { useAuth } from "@repo/providers";

export default function TabsLayout() {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");

  }, [loading, user]);

  if (loading) return null;
  if (!user) return null;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
