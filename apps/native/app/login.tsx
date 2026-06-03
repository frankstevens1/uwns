import { Redirect, useLocalSearchParams } from "expo-router";
import { preserveSearchParams } from "@/lib/redirectParams";
export default function Login() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={{
        pathname: "/(auth)/login",
        params: preserveSearchParams(params as Record<string, string | string[] | undefined>),
      }}
    />
  );
}
