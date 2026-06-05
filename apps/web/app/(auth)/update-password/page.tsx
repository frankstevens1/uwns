"use client";

import * as React from "react";
import { useActions } from "@repo/providers";
import { UpdatePasswordForm } from "@repo/ui";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function UpdatePasswordPage() {
  const { auth, notify, navigate } = useWebAuthWiring();
  const { trackAction } = useActions();

  React.useEffect(() => {
    void trackAction({
      actionName: "update_password_viewed",
      uniqueKey: "web:update_password_viewed",
      metadata: {
        source: "auth",
        screen: "update_password",
        trigger: "first_page_visit",
      },
    });
  }, [trackAction]);

  return (
    <UpdatePasswordForm
      auth={auth}
      notify={notify}
      navigate={navigate}
      routes={{
        afterUpdate: "/login",
      }}
    />
  );
}
