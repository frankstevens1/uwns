import { SignUpForm } from "@repo/ui";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";
import * as Linking from "expo-linking";

export default function SignUpScreen() {
  const { auth, notify, navigate } = useNativeAuthWiring();
  const emailRedirectTo = Linking.createURL("/");

  return (
    <SignUpForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      emailRedirectTo={emailRedirectTo}
      routes={{
        afterSignUp: "/check-email",
        afterOtpVerify: "/",
        login: "/login",
      }}
    />
  );
}
