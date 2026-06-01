import * as React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Modal,
  Platform,
  Pressable,
  Text as RNText,
  TextInput,
  View,
  FlatList,
  StyleSheet,
} from "react-native";
import type { SelectProps, SelectOption } from "./Select.types";
import { inputTokens, useThemeTokens } from "../../theme";

type SelectListEntry =
  | { kind: "group"; id: string; label: string }
  | { kind: "option"; option: SelectOption };

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  search = false,
  size = "md",
  variant = "default",
  style,
}: SelectProps) {
  const tokens = useThemeTokens();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [revealedLabel, setRevealedLabel] = React.useState<string | null>(null);

  const current = options.find((o) => o.value === value);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOptions = React.useMemo(() => {
    if (!search || !normalizedQuery) return options;
    return options.filter((opt) => {
      const label = opt.label.toLowerCase();
      const optionValue = opt.value.toLowerCase();
      return (
        label.includes(normalizedQuery) || optionValue.includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, options, search]);
  const listEntries = React.useMemo<SelectListEntry[]>(() => {
    const entries: SelectListEntry[] = [];
    let lastGroup: string | undefined;

    filteredOptions.forEach((option, index) => {
      if (option.group && option.group !== lastGroup) {
        entries.push({
          kind: "group",
          id: `group:${option.group}:${index}`,
          label: option.group,
        });
        lastGroup = option.group;
      }
      entries.push({ kind: "option", option });
    });

    return entries;
  }, [filteredOptions]);
  const t = inputTokens.base;
  const triggerHeight = size === "sm" ? t.height.sm : t.height.md;
  const isGhost = variant === "ghost";

  const close = () => {
    setOpen(false);
    setSearchQuery("");
    setRevealedLabel(null);
  };

  const pick = (opt: SelectOption) => {
    onChange(opt.value);
    close();
  };

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        onLongPress={() => {
          if (!current?.label) return;
          setRevealedLabel(current.label);
          setOpen(true);
        }}
        style={[
          styles.trigger,
          {
            backgroundColor: isGhost ? "transparent" : tokens.color.bg,
            borderColor: isGhost ? "transparent" : tokens.color.border,
            borderRadius: t.radius,
            borderWidth: isGhost ? 0 : 1,
            height: triggerHeight,
            paddingHorizontal: t.paddingX,
            opacity: disabled ? tokens.opacity.disabled : 1,
          },
          style,
        ]}
      >
        <View style={styles.triggerContent}>
          <RNText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: current ? tokens.color.fg : tokens.color.mutedFg,
              fontSize: t.fontSize,
              fontFamily: Platform.select({
                ios: isGhost ? "Menlo" : undefined,
                android: isGhost ? "monospace" : undefined,
              }),
              flex: 1,
            }}
          >
            {current?.label ?? placeholder}
          </RNText>
          <RNText
            style={{
              color: tokens.color.mutedFg,
              fontSize: t.fontSize + 2,
              marginLeft: 8,
            }}
          >
            ▾
          </RNText>
        </View>
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: tokens.color.bg,
                borderColor: tokens.color.border,
                borderRadius: tokens.radius.lg,
              },
            ]}
          >
            <RNText
              style={{
                color: tokens.color.fg,
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              {placeholder}
            </RNText>

            {search ? (
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor={tokens.color.mutedFg}
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
                onKeyPress={(event) => {
                  if (event.nativeEvent.key !== "Escape") return;
                  if (searchQuery) {
                    setSearchQuery("");
                  } else {
                    close();
                  }
                }}
                style={[
                  styles.searchInput,
                  {
                    borderColor: tokens.color.border,
                    color: tokens.color.fg,
                    borderRadius: t.radius,
                    fontSize: t.fontSize,
                  },
                ]}
              />
            ) : null}

            {revealedLabel ? (
              <View
                style={[
                  styles.reveal,
                  {
                    backgroundColor: tokens.color.subtleBg,
                    borderColor: tokens.color.border,
                    borderRadius: t.radius,
                  },
                ]}
              >
                <RNText
                  style={{ color: tokens.color.fg, fontSize: t.fontSize }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {revealedLabel}
                </RNText>
              </View>
            ) : null}

            <FlatList
              data={listEntries}
              keyExtractor={(item) =>
                item.kind === "group" ? item.id : item.option.value
              }
              showsVerticalScrollIndicator={false}
              style={styles.list}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: 1,
                    backgroundColor: tokens.color.border,
                    opacity: 0.6,
                  }}
                />
              )}
              ListEmptyComponent={() => (
                <View style={styles.empty}>
                  <RNText
                    style={{
                      color: tokens.color.mutedFg,
                      fontSize: t.fontSize,
                    }}
                  >
                    No results
                  </RNText>
                </View>
              )}
              renderItem={({ item }) => {
                if (item.kind === "group") {
                  return (
                    <View style={styles.groupHeader}>
                      <RNText
                        style={{
                          color: tokens.color.mutedFg,
                          fontSize: 11,
                          fontWeight: "600",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.label}
                      </RNText>
                    </View>
                  );
                }

                const option = item.option;
                const selected = option.value === value;
                return (
                  <Pressable
                    onPress={() => pick(option)}
                    onLongPress={() => setRevealedLabel(option.label)}
                    style={[
                      styles.item,
                      selected && { backgroundColor: tokens.color.subtleBg },
                    ]}
                  >
                    <View style={styles.checkSlot}>
                      {selected ? (
                        <MaterialIcons
                          name="check"
                          size={16}
                          color={tokens.color.fg}
                        />
                      ) : null}
                    </View>
                    <RNText
                      style={[
                        styles.itemText,
                        {
                          color: tokens.color.fg,
                          fontSize: t.fontSize,
                          fontFamily: Platform.select({
                            ios: isGhost ? "Menlo" : undefined,
                            android: isGhost ? "monospace" : undefined,
                          }),
                          fontWeight: selected ? "600" : "500",
                        },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {option.label}
                    </RNText>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    justifyContent: "center",
    minWidth: 0,
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 18,
    justifyContent: "center",
  },
  sheet: { borderWidth: 1, padding: 14, maxHeight: "70%" },
  searchInput: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  reveal: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  list: {
    maxHeight: 320,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupHeader: {
    paddingHorizontal: 2,
    paddingBottom: 4,
    paddingTop: 10,
  },
  checkSlot: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    flex: 1,
    minWidth: 0,
  },
  empty: {
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
});
