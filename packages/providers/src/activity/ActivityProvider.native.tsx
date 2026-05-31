import { useAuth } from "../auth/AuthProvider.native";
import { createActivityProvider } from "./ActivityProvider.shared";

const { ActivityProvider, useActivity } = createActivityProvider(useAuth, "native");

export { ActivityProvider, useActivity };
