import { useCallback } from "react";

type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [50, 100, 50],
  selection: 5,
};

export const useHapticFeedback = () => {
  const isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;

  const vibrate = useCallback((pattern: HapticPattern = "light") => {
    if (!isSupported) return false;
    
    try {
      return navigator.vibrate(patterns[pattern]);
    } catch {
      return false;
    }
  }, [isSupported]);

  const light = useCallback(() => vibrate("light"), [vibrate]);
  const medium = useCallback(() => vibrate("medium"), [vibrate]);
  const heavy = useCallback(() => vibrate("heavy"), [vibrate]);
  const success = useCallback(() => vibrate("success"), [vibrate]);
  const warning = useCallback(() => vibrate("warning"), [vibrate]);
  const error = useCallback(() => vibrate("error"), [vibrate]);
  const selection = useCallback(() => vibrate("selection"), [vibrate]);

  return {
    isSupported,
    vibrate,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
  };
};

// Standalone function for use outside React components
export const triggerHaptic = (pattern: HapticPattern = "light") => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(patterns[pattern]);
    } catch {
      // Silently fail
    }
  }
};
