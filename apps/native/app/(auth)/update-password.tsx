import * as React from "react";
import { useActions } from "@repo/providers";
import { UpdatePasswordForm } from "@repo/ui";
import { useNativeAuthWiring } from "@/lib/nativeAuthProps";

export default function UpdatePasswordScreen() {
  const { auth, notify, navigate } = useNativeAuthWiring();
  const { trackAction } = useActions();

  React.useEffect(() => {
    void trackAction({
      actionName: "update_password_viewed",
      uniqueKey: "native:update_password_viewed",
      metadata: {
        source: "auth",
        screen: "update_password",
        trigger: "first_view",
      },
    });
  }, [trackAction]);

  return (
    <UpdatePasswordForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      routes={{
        afterUpdate: "/(auth)/login",
      }}
    />
  );
}
