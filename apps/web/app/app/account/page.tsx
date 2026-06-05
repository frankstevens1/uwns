"use client";

import * as React from "react";
import { abbreviatedCodeSnippet, Code, CodeBlock, Tip } from "@repo/ui";
import { useActions } from "@repo/providers";
import { useTheme } from "next-themes";
import { SignedInIdentity } from "./SignedInIdentity";

const signedInIdentityWebExample = abbreviatedCodeSnippet([
  `"use client";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ReadOnlyInput,
} from "@repo/ui";
import { useActions, useAuth } from "@repo/providers";`,
  `export function SignedInIdentity() {
  const { user, loading, signOut } = useAuth();
  const { trackAction } = useActions();

  async function handleSignOut() {
    await trackAction({
      actionName: "signed_out",
      metadata: { trigger: "account_card" },
    });
    await signOut();
  }

  return (
    <Card padding="none" elevation="sm">
      <CardHeader>
        <div className="text-sm font-medium">Signed-in identity</div>
      </CardHeader>
      <CardBody>
        <ReadOnlyInput label="Email" value={user?.email} loading={loading} />
        <ReadOnlyInput label="User ID" value={user?.id} loading={loading} />
      </CardBody>
      <CardFooter>
        <Button onPress={handleSignOut} disabled={loading || !user}>
          Sign out
        </Button>
      </CardFooter>
    </Card>
  );
}`,
]);

const signedInIdentityNativeExample = abbreviatedCodeSnippet([
  `import { Text, View } from "react-native";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ReadOnlyInput,
  useThemeTokens,
} from "@repo/ui";
import { useActions, useAuth } from "@repo/providers";`,
  `export function SignedInIdentity() {
  const { user, loading, signOut } = useAuth();
  const { trackAction } = useActions();
  const tokens = useThemeTokens();

  async function handleSignOut() {
    await trackAction({
      actionName: "signed_out",
      metadata: { trigger: "account_card" },
    });
    await signOut();
  }

  return (
    <Card padding="none" elevation="sm">
      <CardHeader>
        <Text style={{ color: tokens.color.fg }}>Signed-in identity</Text>
      </CardHeader>
      <CardBody>
        <View style={{ gap: 12 }}>
          <ReadOnlyInput label="Email" value={user?.email} loading={loading} />
          <ReadOnlyInput label="User ID" value={user?.id} loading={loading} />
        </View>
      </CardBody>
      <CardFooter>
        <Button onPress={handleSignOut} disabled={loading || !user}>
          Sign out
        </Button>
      </CardFooter>
    </Card>
  );
}`,
]);

const webLayoutExample = abbreviatedCodeSnippet([
  `import { ActionProvider, AuthProvider } from "@repo/providers";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Shell } from "@/components/Shell";`,
  `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ActionProvider>
          <Shell>{children}</Shell>
        </ActionProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}`,
]);

const nativeLayoutExample = abbreviatedCodeSnippet([
  `import { Stack } from "expo-router";
import { ActionProvider, AuthProvider } from "@repo/providers";
import { ThemeProvider, darkTokens, lightTokens } from "@repo/ui";
import { useColorScheme } from "react-native";`,
  `export default function RootLayout() {
  const scheme = useColorScheme();
  const tokens = scheme === "dark" ? darkTokens : lightTokens;

  return (
    <AuthProvider>
      <ActionProvider>
        <ThemeProvider tokens={tokens}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </ActionProvider>
    </AuthProvider>
  );
}`,
]);

export default function AccountPage() {
  const { resolvedTheme } = useTheme();
  const { trackAction } = useActions();

  React.useEffect(() => {
    void trackAction({
      actionName: "account_viewed",
      uniqueKey: "web:account_viewed",
      metadata: {
        source: "account",
        screen: "account_page",
        trigger: "first_page_visit",
      },
    });
  }, [trackAction]);

  return (
    <section className="space-y-6 pb-14">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Account</h2>
        <p className="max-w-2xl text-sm text-(--ui-muted-fg)">
          A minimal user-specific route showing authenticated data from
          Supabase.
        </p>
      </header>

      <div className="lg:grid space-y-6 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SignedInIdentity />
          <Tip>
            Use <Code>@repo/providers</Code> for auth state and compose it with
            shared <Code>@repo/ui</Code> primitives to build matching web and
            native components from the same building blocks.
          </Tip>
        </div>
        <div className="lg:col-span-2">
          <CodeBlock
            snippets={[
              {
                id: "web-identity",
                label: "SignedInIdentity.web.tsx",
                group: "web",
                filename: "SignedInIdentity.web.tsx",
                language: "tsx",
                code: signedInIdentityWebExample,
              },
              {
                id: "web-layout",
                label: "layout.tsx",
                group: "web",
                filename: "apps/web/app/layout.tsx",
                language: "tsx",
                code: webLayoutExample,
              },
              {
                id: "native-identity",
                label: "SignedInIdentity.native.tsx",
                group: "native",
                filename: "SignedInIdentity.native.tsx",
                language: "tsx",
                code: signedInIdentityNativeExample,
              },
              {
                id: "native-layout",
                label: "_layout.tsx",
                group: "native",
                filename: "apps/native/app/_layout.tsx",
                language: "tsx",
                code: nativeLayoutExample,
              },
            ]}
            showLineNumbers={false}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
          />
        </div>
      </div>
    </section>
  );
}
