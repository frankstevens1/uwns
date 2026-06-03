import { Redirect, useLocalSearchParams } from "expo-router";
import { preserveSearchParams } from "@/lib/redirectParams";
export default function UpdatePassword() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={{
        pathname: "/(auth)/update-password",
        params: preserveSearchParams(params as Record<string, string | string[] | undefined>),
      }}
    />
  );
}
