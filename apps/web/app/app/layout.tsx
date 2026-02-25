"use client";

import * as React from "react";
import { useAuth } from "@repo/providers";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <div className="p-8 text-sm text-neutral-600">Loading…</div>;
  if (!user) return null;

  return <>{children}</>;
}
