import { Redirect, useLocalSearchParams } from "expo-router";
import { preserveSearchParams } from "@/lib/redirectParams";
export default function SignUp() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={{
        pathname: "/(auth)/sign-up",
        params: preserveSearchParams(params as Record<string, string | string[] | undefined>),
      }}
    />
  );
}
