import * as React from "react";

let hasSetup = false;
let hadKeyboardEvent = true;

function setupFocusVisibleListeners() {
  if (hasSetup || typeof window === "undefined") return;
  hasSetup = true;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.metaKey || event.altKey || event.ctrlKey) return;
    hadKeyboardEvent = true;
  };

  const onPointerDown = () => {
    hadKeyboardEvent = false;
  };

  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("mousedown", onPointerDown, true);
  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("touchstart", onPointerDown, true);
}

export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    setupFocusVisibleListeners();
  }, []);

  const onFocus = React.useCallback(() => {
    setIsFocusVisible(hadKeyboardEvent);
  }, []);

  const onBlur = React.useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  return { isFocusVisible, onFocus, onBlur };
}
