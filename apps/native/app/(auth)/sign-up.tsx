import { SignUpForm } from "@repo/ui";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";

export default function SignUpScreen() {
  const { auth, notify, navigate } = useNativeAuthWiring();

  return (
    <SignUpForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      routes={{
        afterSignUp: "/check-email",
        login: "/login",
      }}
    />
  );
}
