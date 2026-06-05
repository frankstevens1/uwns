"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActions, useAuth } from "@repo/providers";
import { toUiAuthClient } from "./uiAuthAdapter";

export function useWebAuthWiring(flow: "login" | "sign-up" = "login") {
  const router = useRouter();
  const auth = useAuth();
  const { trackAction } = useActions();

  const notify = {
    success: (title: string, opts?: { description?: string }) =>
      toast.success(title, { description: opts?.description }),
    error: (title: string, opts?: { description?: string }) =>
      toast.error(title, { description: opts?.description }),
  };

  const navigate = (href: string) => router.push(href);

  return { auth: toUiAuthClient(auth, { flow, trackAction }), notify, navigate };
}
