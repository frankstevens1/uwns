export type WelcomeProps = {
  email?: string;
  title?: string;
  description?: string;

  /**
   * Called when user wants to open their mailbox
   * (web: window.open, native: Linking.openURL)
   */
  onOpenMailbox?: () => void;

  /**
   * Optional fallback action (e.g. "Back to sign in").
   */
  onContinue?: () => void;
};
