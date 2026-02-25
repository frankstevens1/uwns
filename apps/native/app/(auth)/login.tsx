import { LoginForm } from "@repo/ui";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";

export default function LoginScreen() {
  const { auth, notify, navigate } = useNativeAuthWiring();

  return (
    <LoginForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      routes={{
        forgotPassword: "/forgot-password",
        signUp: "/sign-up",
      }}
    />
  );
}
