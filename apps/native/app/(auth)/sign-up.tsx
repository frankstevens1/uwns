import { AuthFlow } from "@/components/AuthFlow";
import { normalizeAuthFocusParam } from "@/lib/authFocus";
import { useLocalSearchParams } from "expo-router";
import { normalizeAuthMethodParam } from "@repo/ui";

export default function SignUpScreen() {
  const { focus, authMethod } = useLocalSearchParams<{
    focus?: string | string[];
    authMethod?: string | string[];
  }>();
  const initialFocus = normalizeAuthFocusParam(focus);
  const initialMethod = normalizeAuthMethodParam(authMethod);

  return (
    <AuthFlow
      initialMode="sign-up"
      initialFocus={initialFocus}
      initialMethod={initialMethod}
    />
  );
}
