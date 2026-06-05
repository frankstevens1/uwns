import { useAuth } from "../auth/AuthProvider.web";
import { useNotifications } from "../notifications/NotificationProvider.web";
import { createActionsProvider } from "./ActionProvider.shared";

const { ActionProvider, useActions } = createActionsProvider(
  useAuth,
  "web",
  useNotifications,
);

export { ActionProvider, useActions };
