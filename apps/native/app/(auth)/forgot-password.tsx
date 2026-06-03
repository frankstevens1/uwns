import { AuthFlow } from "@/components/AuthFlow";
import { normalizeAuthFocusParam } from "@/lib/authFocus";
import { useLocalSearchParams } from "expo-router";

export default function ForgotPasswordScreen() {
  const { focus } = useLocalSearchParams<{ focus?: string | string[] }>();
  const initialFocus = normalizeAuthFocusParam(focus);

  return <AuthFlow initialMode="forgot-password" initialFocus={initialFocus} />;
}
