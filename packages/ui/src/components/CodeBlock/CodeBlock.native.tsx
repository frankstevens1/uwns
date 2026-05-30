import * as Clipboard from "expo-clipboard";
import * as React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { CodeBlockProps } from "./CodeBlock.types";
import { useThemeTokens } from "../../theme";

type CodeToken = {
  text: string;
  kind: "plain" | "keyword" | "string" | "comment" | "number" | "type" | "tag";
};

const jsTsKeywords = new Set([
  "as",
  "async",
  "await",
  "catch",
  "const",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "from",
  "function",
  "if",
  "import",
  "in",
  "interface",
  "let",
  "new",
  "null",
  "of",
  "return",
  "true",
  "try",
  "type",
  "undefined",
  "var",
]);

function inferLanguage(language: string, filename?: string) {
  if (language !== "text") return language;
  const extension = filename?.split(".").pop()?.toLowerCase();

  if (extension === "tsx") return "tsx";
  if (extension === "ts") return "typescript";
  if (extension === "jsx") return "jsx";
  if (extension === "js") return "javascript";
  if (extension === "json") return "json";

  return language;
}

function isSyntaxLanguage(language: string) {
  return ["javascript", "jsx", "typescript", "tsx", "json"].includes(language);
}

function isDarkHex(hex: string) {
  if (!hex.startsWith("#")) return false;
  const value = hex.slice(1);
  if (value.length !== 6) return false;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return luminance < 0.5;
}

function tokenizeCodeLine(line: string, language: string): CodeToken[] {
  if (!isSyntaxLanguage(language) || !line) {
    return [{ text: line || " ", kind: "plain" }];
  }

  const tokens: CodeToken[] = [];
  const pattern =
    /\/\/.*|\/\*.*?\*\/|(["'`])(?:\\.|(?!\1).)*\1|<\/?[A-Za-z][\w.:-]*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b/g;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line))) {
    if (match.index > index) {
      tokens.push({ text: line.slice(index, match.index), kind: "plain" });
    }

    const text = match[0];
    let kind: CodeToken["kind"] = "plain";

    if (text.startsWith("//") || text.startsWith("/*")) {
      kind = "comment";
    } else if (text.startsWith("\"") || text.startsWith("'") || text.startsWith("`")) {
      kind = "string";
    } else if (text.startsWith("<")) {
      kind = "tag";
    } else if (/^\d/.test(text)) {
      kind = "number";
    } else if (jsTsKeywords.has(text)) {
      kind = "keyword";
    } else if (/^[A-Z]/.test(text)) {
      kind = "type";
    }

    tokens.push({ text, kind });
    index = pattern.lastIndex;
  }

  if (index < line.length) {
    tokens.push({ text: line.slice(index), kind: "plain" });
  }

  return tokens;
}

export function CodeBlock({
  code,
  language = "text",
  filename,
  showLineNumbers = true,
  copyable = true,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  style,
}: CodeBlockProps) {
  const tokens = useThemeTokens();
  const label = filename ?? language;
  const [copied, setCopied] = React.useState(false);
  const resolvedLanguage = inferLanguage(language, filename);
  const lines = React.useMemo(() => code.split("\n"), [code]);
  const highlightedLines = React.useMemo(
    () => lines.map((line) => tokenizeCodeLine(line, resolvedLanguage)),
    [lines, resolvedLanguage],
  );
  const dark = isDarkHex(tokens.color.bg);
  const syntaxColors = dark
    ? {
        comment: "rgba(255,255,255,0.42)",
        keyword: "#c084fc",
        number: "#fdba74",
        plain: tokens.color.fg,
        string: "#86efac",
        tag: "#7dd3fc",
        type: "#facc15",
      }
    : {
        comment: "rgba(0,0,0,0.45)",
        keyword: "#7c3aed",
        number: "#b45309",
        plain: tokens.color.fg,
        string: "#047857",
        tag: "#0369a1",
        type: "#a16207",
      };

  const onCopy = async () => {
    if (!copyable) return;

    await Clipboard.setStringAsync(code);
    setCopied(true);
    globalThis.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: dark ? "#111113" : "#fbfbfc",
          borderColor: tokens.color.border,
          borderRadius: tokens.radius.lg,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: dark ? "#17171a" : "#f3f4f6",
            borderBottomColor: tokens.color.border,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <View
            style={[styles.dot, { backgroundColor: tokens.color.border }]}
          />
          <Text
            numberOfLines={1}
            style={[styles.title, { color: tokens.color.mutedFg }]}
          >
            {label}
          </Text>
        </View>

        {copyable ? (
          <Pressable
            onPress={onCopy}
            style={({ pressed }) => [
              styles.copyButton,
              {
                backgroundColor: pressed ? tokens.color.subtleBg : "transparent",
              },
            ]}
          >
            <MaterialIcons
              name={copied ? "check" : "content-copy"}
              size={13}
              color={tokens.color.mutedFg}
            />
            <Text style={[styles.copyText, { color: tokens.color.mutedFg }]}>
              {copied ? copiedLabel : copyLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={styles.body}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {highlightedLines.map((lineTokens, index) => (
            <View key={`${index}-${lines[index]}`} style={styles.line}>
              {showLineNumbers ? (
                <Text style={[styles.lineNumber, { color: tokens.color.mutedFg }]}>
                  {index + 1}
                </Text>
              ) : null}
              <Text style={[styles.code, { color: tokens.color.fg }]}>
                {lineTokens.map((token, tokenIndex) => (
                  <Text
                    key={`${tokenIndex}-${token.text}`}
                    style={{ color: syntaxColors[token.kind] }}
                  >
                    {token.text}
                  </Text>
                ))}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 38,
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  titleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  title: {
    flex: 1,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 12,
    fontWeight: "500",
  },
  copyButton: {
    alignItems: "center",
    borderRadius: 6,
    flexDirection: "row",
    gap: 5,
    height: 28,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  copyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  body: {
    paddingBottom: 14,
    paddingRight: 16,
    paddingTop: 14,
  },
  line: {
    flexDirection: "row",
    minHeight: 21,
  },
  lineNumber: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 12,
    lineHeight: 21,
    paddingLeft: 12,
    paddingRight: 12,
    textAlign: "right",
    width: 48,
  },
  code: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 12,
    lineHeight: 21,
    paddingLeft: 14,
  },
});
