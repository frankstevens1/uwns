import { useAuth } from "../auth/AuthProvider.web";
import { useNotifications } from "../notifications/NotificationProvider.web";
import { createActivityProvider } from "./ActivityProvider.shared";

const { ActivityProvider, useActivity } = createActivityProvider(
  useAuth,
  "web",
  useNotifications,
);

export { ActivityProvider, useActivity };
