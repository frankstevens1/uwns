import { LoginForm } from "@repo/ui";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";
import * as Linking from "expo-linking";

export default function LoginScreen() {
  const { auth, notify, navigate } = useNativeAuthWiring();
  const emailRedirectTo = Linking.createURL("/");

  return (
    <LoginForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      emailRedirectTo={emailRedirectTo}
      routes={{
        forgotPassword: "/forgot-password",
        signUp: "/sign-up",
      }}
    />
  );
}
