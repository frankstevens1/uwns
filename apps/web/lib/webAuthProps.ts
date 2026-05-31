"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActivity, useAuth } from "@repo/providers";
import { toUiAuthClient } from "./uiAuthAdapter";

export function useWebAuthWiring(flow: "login" | "sign-up" = "login") {
  const router = useRouter();
  const auth = useAuth();
  const { trackEvent } = useActivity();

  const notify = {
    success: (title: string, opts?: { description?: string }) =>
      toast.success(title, { description: opts?.description }),
    error: (title: string, opts?: { description?: string }) =>
      toast.error(title, { description: opts?.description }),
  };

  const navigate = (href: string) => router.push(href);

  return { auth: toUiAuthClient(auth, { flow, trackEvent }), notify, navigate };
}
