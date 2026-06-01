import { ForgotPasswordForm } from "@repo/ui";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";
import * as Linking from "expo-linking";

export default function ForgotPasswordScreen() {
  const { auth, notify, navigate } = useNativeAuthWiring();
  const redirectTo = Linking.createURL("/update-password");

  return (
    <ForgotPasswordForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      redirectTo={redirectTo}
      routes={{
        afterRequest: "/check-email?type=recovery",
        login: "/login",
      }}
    />
  );
}
