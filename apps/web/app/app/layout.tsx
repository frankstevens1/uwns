"use client";

import * as React from "react";
import { useAuth } from "@repo/providers";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginHref, buildLoginRedirectPath } from "@/lib/authRedirect";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (loading || user) return;

    const redirectTo = buildLoginRedirectPath(
      pathname,
      searchParams.toString(),
    );
    router.replace(buildLoginHref(redirectTo));
  }, [loading, pathname, router, searchParams, user]);

  if (loading)
    return <div className="p-8 text-sm text-(--ui-muted-fg)">Loading…</div>;
  if (!user) return null;

  return <>{children}</>;
}
