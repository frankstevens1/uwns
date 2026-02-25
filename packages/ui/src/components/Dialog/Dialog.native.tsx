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
  return (
    <View pointerEvents="box-none" style={styles.contentFrame}>
      <View
        style={[
          styles.contentBase,
          position === "right" ? styles.contentRight : styles.contentCenter,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function DialogTitle({ children }: DialogTextProps) {
  return <Text style={styles.title}>{children}</Text>;
}

export function DialogDescription({ children }: DialogTextProps) {
  return <Text style={styles.description}>{children}</Text>;
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
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
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
