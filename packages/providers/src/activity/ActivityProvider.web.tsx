import { useAuth } from "../auth/AuthProvider.web";
import { createActivityProvider } from "./ActivityProvider.shared";

const { ActivityProvider, useActivity } = createActivityProvider(useAuth, "web");

export { ActivityProvider, useActivity };
