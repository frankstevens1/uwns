import { ForgotPasswordForm } from "@repo/ui";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";

export default function ForgotPasswordScreen() {
  const { auth, notify, navigate } = useNativeAuthWiring();

  return (
    <ForgotPasswordForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      routes={{
        afterRequest: "/check-email",
        login: "/login",
      }}
    />
  );
}
