import * as React from "react";
import { Animated, Easing, View, Text, StyleSheet } from "react-native";
import type { PasswordRequirementsListProps } from "./PasswordRequirementsList.types";
import { evaluatePassword } from "../../../utils/auth/password";
import { useThemeTokens } from "../../../theme";
import { MaterialIcons } from "@expo/vector-icons";

const COMPACT_ADVANCE_DELAY_MS = 260;

export function PasswordRequirementsList({
  password,
  showFirstUnmetOnly = false,
  inline = false,
}: PasswordRequirementsListProps) {
  const { results } = evaluatePassword(password);
  const tokens = useThemeTokens();
  const firstUnmetIndex = results.findIndex((result) => !result.ok);
  const targetIndex = firstUnmetIndex === -1 ? results.length : firstUnmetIndex;
  const [visibleIndex, setVisibleIndex] = React.useState(targetIndex);
  const [showCompleteFlash, setShowCompleteFlash] = React.useState(false);
  const advanceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pendingTargetRef = React.useRef(targetIndex);
  const hasMountedRef = React.useRef(false);

  React.useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  React.useEffect(() => {
    if (!showFirstUnmetOnly) {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
      setShowCompleteFlash(false);
      return;
    }

    if (targetIndex < visibleIndex) {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
      pendingTargetRef.current = targetIndex;
      setVisibleIndex(targetIndex);
      setShowCompleteFlash(false);
      return;
    }

    if (targetIndex === visibleIndex) {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
      pendingTargetRef.current = targetIndex;
      setShowCompleteFlash(false);
      return;
    }

    pendingTargetRef.current = targetIndex;
    setShowCompleteFlash(true);

    if (!advanceTimerRef.current) {
      advanceTimerRef.current = setTimeout(() => {
        const nextIndex = pendingTargetRef.current;
        advanceTimerRef.current = null;
        pendingTargetRef.current = nextIndex;
        setVisibleIndex(nextIndex);
        setShowCompleteFlash(false);
      }, COMPACT_ADVANCE_DELAY_MS);
    }
  }, [
    showFirstUnmetOnly,
    targetIndex,
    visibleIndex,
    results.length,
  ]);

  React.useEffect(
    () => () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    },
    [],
  );

  if (showFirstUnmetOnly) {
    const row = visibleIndex < results.length ? results[visibleIndex] : null;
    const isComplete = visibleIndex === results.length;
    const isMet = showCompleteFlash && !isComplete;
    if (!row && !isComplete) return null;
    const color = isComplete || isMet ? tokens.color.successFg : tokens.color.mutedFg;

    return (
      <CompactRequirementRow
        key={visibleIndex}
        animateEnter={hasMountedRef.current}
        flashActive={isMet}
        inline={inline}
        label={isComplete ? "Password requirements met" : row?.label ?? ""}
        completed={isComplete || isMet}
        color={color}
      />
    );
  }

  return (
    <View style={{ marginTop: 8, gap: 4 }}>
      {results.map((r) => (
        <View key={r.id} style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons
            name="check-circle"
            size={16}
            color={r.ok ? tokens.color.successFg : tokens.color.mutedFg}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontSize: 13,
              color: r.ok ? tokens.color.successFg : tokens.color.mutedFg,
            }}
          >
            {r.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  compact: {
    marginTop: 6,
  },
  inlineCompact: {
    flex: 1,
    marginTop: 0,
    minWidth: 0,
  },
  compactRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});

type CompactRequirementRowProps = {
  animateEnter: boolean;
  flashActive: boolean;
  inline: boolean;
  label: string;
  completed: boolean;
  color: string;
};

function CompactRequirementRow({
  animateEnter,
  flashActive,
  inline,
  label,
  completed,
  color,
}: CompactRequirementRowProps) {
  const enterProgress = React.useRef(new Animated.Value(animateEnter ? 0 : 1)).current;
  const flashProgress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!animateEnter) return;

    enterProgress.stopAnimation();
    enterProgress.setValue(0);
    Animated.timing(enterProgress, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animateEnter, enterProgress]);

  React.useEffect(() => {
    flashProgress.stopAnimation();
    flashProgress.setValue(0);

    if (!flashActive) return;

    Animated.timing(flashProgress, {
      toValue: 1,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [flashActive, flashProgress]);

  const enterTranslateY = enterProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0],
  });
  const flashScale = flashProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });
  const flashOpacity = flashProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <Animated.View
      style={[
        inline ? styles.inlineCompact : styles.compact,
        {
          opacity: enterProgress,
          transform: [{ translateY: enterTranslateY }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.compactRow,
          {
            opacity: flashOpacity,
            transform: [{ scale: flashScale }],
          },
        ]}
      >
        <MaterialIcons
          name={completed ? "check-circle" : "radio-button-unchecked"}
          size={16}
          color={color}
          style={{ marginRight: 6 }}
        />
        <Text
          numberOfLines={inline ? 1 : undefined}
          style={{
            fontSize: 12,
            flexShrink: 1,
            color,
            fontWeight: completed ? "600" : "400",
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
