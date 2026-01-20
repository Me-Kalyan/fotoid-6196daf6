import { useEffect, useCallback } from "react";

interface KeyboardShortcutsConfig {
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetView,
  onEscape,
  enabled = true,
}: KeyboardShortcutsConfig) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl/Cmd + Z
      if (ctrlOrCmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl + Y
      if (
        (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === "z") ||
        (ctrlOrCmd && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        onRedo?.();
        return;
      }

      // Zoom In: + or =
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        onZoomIn?.();
        return;
      }

      // Zoom Out: -
      if (e.key === "-") {
        e.preventDefault();
        onZoomOut?.();
        return;
      }

      // Reset View: 0
      if (e.key === "0" && !ctrlOrCmd) {
        e.preventDefault();
        onResetView?.();
        return;
      }

      // Escape
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }
    },
    [enabled, onUndo, onRedo, onZoomIn, onZoomOut, onResetView, onEscape]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
