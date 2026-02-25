import { createSupabaseClient } from "../supabase/createClient.web";
import { createAuthProvider } from "./AuthProvider.shared";

const { AuthProvider, useAuth } = createAuthProvider(createSupabaseClient);

export { AuthProvider, useAuth };
