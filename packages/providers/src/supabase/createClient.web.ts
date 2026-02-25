"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();

  /**
   * Cookie-based auth (via @supabase/ssr)
   * - Server route handlers can read the session via cookies
   */
  return createBrowserClient(url, anonKey);
}
