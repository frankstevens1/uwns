"use client";

import { UpdatePasswordForm } from "@repo/ui";
import { useWebAuthWiring } from "@/lib/webAuthProps";

export default function UpdatePasswordPage() {
  const { auth, notify, navigate } = useWebAuthWiring();

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
