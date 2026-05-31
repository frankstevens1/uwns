import * as React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type {
  DialogContentProps,
  DialogFooterProps,
  DialogOverlayProps,
  DialogPrimitiveProps,
  DialogRootProps,
  DialogTextProps,
} from "./Dialog.types";
import { useThemeTokens } from "../../theme";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(componentName: string) {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error(`${componentName} must be used within DialogRoot.`);
  }
  return context;
}

function composePressHandlers(
  first?: (...args: any[]) => void,
  second?: (...args: any[]) => void,
) {
  return (...args: any[]) => {
    first?.(...args);
    second?.(...args);
  };
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

export function DialogRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = typeof open === "boolean";
  const resolvedOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DialogContext.Provider value={{ open: resolvedOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, asChild }: DialogPrimitiveProps) {
  const { setOpen } = useDialogContext("DialogTrigger");

  if (asChild && React.isValidElement(children)) {
    const element = children as React.ReactElement<{
      onPress?: (...args: any[]) => void;
    }>;
    return React.cloneElement(element, {
      onPress: composePressHandlers(element.props.onPress, () => setOpen(true)),
    });
  }

  return <Pressable onPress={() => setOpen(true)}>{children}</Pressable>;
}

export function DialogPortal({ children }: DialogPrimitiveProps) {
  const { open, setOpen } = useDialogContext("DialogPortal");
  if (!open) return null;

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <View style={styles.modalRoot}>{children}</View>
    </Modal>
  );
}

export function DialogClose({ children, asChild }: DialogPrimitiveProps) {
  const { setOpen } = useDialogContext("DialogClose");

  if (asChild && React.isValidElement(children)) {
    const element = children as React.ReactElement<{
      onPress?: (...args: any[]) => void;
    }>;
    return React.cloneElement(element, {
      onPress: composePressHandlers(element.props.onPress, () =>
        setOpen(false),
      ),
    });
  }

  return <Pressable onPress={() => setOpen(false)}>{children}</Pressable>;
}

export function DialogOverlay({ children }: DialogOverlayProps) {
  const { setOpen } = useDialogContext("DialogOverlay");
  return (
    <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
      {children}
    </Pressable>
  );
}

export function DialogContent({
  children,
  position = "center",
}: DialogContentProps) {
  const tokens = useThemeTokens();
  const dark = isDarkHex(tokens.color.bg);

  return (
    <View pointerEvents="box-none" style={styles.contentFrame}>
      <View
        style={[
          styles.contentBase,
          {
            backgroundColor: dark ? "#1b1b1f" : tokens.color.bg,
            borderColor: tokens.color.border,
            borderRadius: tokens.radius.lg,
          },
          position === "right" ? styles.contentRight : styles.contentCenter,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function DialogTitle({ children }: DialogTextProps) {
  const tokens = useThemeTokens();
  return (
    <Text style={[styles.title, { color: tokens.color.fg }]}>
      {children}
    </Text>
  );
}

export function DialogDescription({ children }: DialogTextProps) {
  const tokens = useThemeTokens();
  return (
    <Text style={[styles.description, { color: tokens.color.mutedFg }]}>
      {children}
    </Text>
  );
}

export function DialogFooter({ children }: DialogFooterProps) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  contentFrame: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  contentBase: {
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  contentCenter: {
    width: "92%",
    maxWidth: 420,
    padding: 16,
  },
  contentRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "96%",
    maxWidth: 720,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
