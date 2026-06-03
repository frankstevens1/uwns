import { useAuth } from "../auth/AuthProvider.native";
import { useNotifications } from "../notifications/NotificationProvider.native";
import { createActivityProvider } from "./ActivityProvider.shared";

const { ActivityProvider, useActivity } = createActivityProvider(
  useAuth,
  "native",
  useNotifications,
);

export { ActivityProvider, useActivity };
