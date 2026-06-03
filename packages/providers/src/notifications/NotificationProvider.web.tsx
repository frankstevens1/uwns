"use client";

import { useAuth } from "../auth/AuthProvider.web";
import { createNotificationsProvider } from "./NotificationProvider.shared";

const { NotificationsProvider, useNotifications } =
  createNotificationsProvider(useAuth);

export { NotificationsProvider, useNotifications };
