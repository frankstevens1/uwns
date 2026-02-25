import { createSupabaseClient } from "../supabase/createClient.native";
import { createAuthProvider } from "./AuthProvider.shared";

const { AuthProvider, useAuth } = createAuthProvider(createSupabaseClient);

export { AuthProvider, useAuth };
