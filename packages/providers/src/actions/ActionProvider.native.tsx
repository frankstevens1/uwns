import { useAuth } from "../auth/AuthProvider.native";
import { useNotifications } from "../notifications/NotificationProvider.native";
import { createActionsProvider } from "./ActionProvider.shared";

const { ActionProvider, useActions } = createActionsProvider(
  useAuth,
  "native",
  useNotifications,
);

export { ActionProvider, useActions };
