import { Redirect, useLocalSearchParams } from "expo-router";
import { preserveSearchParams } from "@/lib/redirectParams";
export default function ForgotPassword() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={{
        pathname: "/(auth)/forgot-password",
        params: preserveSearchParams(params as Record<string, string | string[] | undefined>),
      }}
    />
  );
}
