import { UpdatePasswordForm } from "@repo/ui";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";

export default function UpdatePasswordScreen() {
  const { auth, notify, navigate } = useNativeAuthWiring();

  return (
    <UpdatePasswordForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      routes={{
        afterUpdate: "/login"
      }}
    />
  );
}
