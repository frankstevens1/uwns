import * as React from "react";
import { Stack } from "expo-router";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  StyleSheet,
  type KeyboardEvent,
} from "react-native";
import { useThemeTokens } from "@repo/ui";

const ROOT_BOTTOM_PADDING = 20;

function useStableKeyboardInset() {
  const [keyboardInset, setKeyboardInset] = React.useState(0);
  const keyboardOpenRef = React.useRef(false);

  React.useEffect(() => {
    if (Platform.OS !== "ios") return;

    const onShow = (event: KeyboardEvent) => {
      if (keyboardOpenRef.current) return;

      keyboardOpenRef.current = true;
      Keyboard.scheduleLayoutAnimation(event);
      setKeyboardInset(event.endCoordinates.height);
    };

    const onHide = (event: KeyboardEvent) => {
      keyboardOpenRef.current = false;
      Keyboard.scheduleLayoutAnimation(event);
      setKeyboardInset(0);
    };

    const showSubscription = Keyboard.addListener("keyboardWillShow", onShow);
    const hideSubscription = Keyboard.addListener("keyboardWillHide", onHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardInset;
}

export default function AuthLayout() {
  const tokens = useThemeTokens();
  const backgroundStyle = { backgroundColor: tokens.color.bg };
  const keyboardInset = useStableKeyboardInset();
  const content = (
    <View style={[styles.container, backgroundStyle]}>
      <View style={[styles.stack, backgroundStyle]}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            keyboardHandlingEnabled: false,
            contentStyle: [styles.content, backgroundStyle],
          }}
        />
      </View>

      <Text style={[styles.footer, { color: tokens.color.mutedFg }]}>
        datafluent
      </Text>
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <View
        style={[
          styles.root,
          backgroundStyle,
          { paddingBottom: ROOT_BOTTOM_PADDING + keyboardInset },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, backgroundStyle]}
      behavior="height"
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: ROOT_BOTTOM_PADDING,
    alignItems: "center",
  },

  container: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
  },

  stack: {
    flex: 1,
    justifyContent: "center",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    paddingTop: 16,
    paddingBottom: 12,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
});
