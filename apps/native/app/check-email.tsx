import { Redirect, useLocalSearchParams } from "expo-router";
import { preserveSearchParams } from "@/lib/redirectParams";
export default function CheckEmail() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={{
        pathname: "/(auth)/check-email",
        params: preserveSearchParams(params as Record<string, string | string[] | undefined>),
      }}
    />
  );
}
