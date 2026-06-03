import * as Notifications from "expo-notifications";
import { useAuth } from "../auth/AuthProvider.native";
import { createNotificationsProvider } from "./NotificationProvider.shared";

const pushRegistration = {
  async register() {
    const existing = await Notifications.getPermissionsAsync();
    const finalStatus =
      existing.status === "granted"
        ? existing.status
        : (await Notifications.requestPermissionsAsync()).status;

    if (finalStatus !== "granted") return null;

    const token = await Notifications.getExpoPushTokenAsync();
    return { token: token.data };
  },
};

const { NotificationsProvider, useNotifications } =
  createNotificationsProvider(useAuth, pushRegistration);

export { NotificationsProvider, useNotifications };
