import { useEffect, useState, useCallback } from 'react';

interface UseQuizSecurityProps {
  maxViolations?: number;
  onViolationMaxReached?: () => void;
  onViolation?: (count: number) => void;
  enabled?: boolean;
}

export function useQuizSecurity({
  maxViolations = 3,
  onViolationMaxReached,
  onViolation,
  enabled = true,
}: UseQuizSecurityProps = {}) {
  const [violationCount, setViolationCount] = useState(0);

  const handleViolation = useCallback(() => {
    setViolationCount((prev) => {
      const newCount = prev + 1;
      if (onViolation) {
        onViolation(newCount);
      }
      if (newCount >= maxViolations && onViolationMaxReached) {
        onViolationMaxReached();
      }
      return newCount;
    });
  }, [maxViolations, onViolation, onViolationMaxReached]);

  useEffect(() => {
    if (!enabled) return;

    // 1. Prevent context menu (right click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent copy, cut, paste
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 3. Prevent keyboard shortcuts (Ctrl+C, Ctrl+V, F12, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j')) ||
        (e.ctrlKey && (key === 'u' || key === 'c' || key === 'v' || key === 'x' || key === 'p' || key === 's'))
      ) {
        e.preventDefault();
      }
    };

    // 4. Detect visibility change (tab switching, window minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleViolation, enabled]);

  return { violationCount };
}
