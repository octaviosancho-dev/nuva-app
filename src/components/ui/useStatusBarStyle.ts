import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle, type StatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';

/**
 * Sets the status bar to match the header the screen is showing.
 *
 * Most onboarding headers are plum or brick and take `light`. The sage header
 * inverts to ink on light (§7), and light status bar glyphs vanish against it.
 *
 * This runs on focus rather than on mount: the navigator keeps popped-to screens
 * mounted, so a screen that only set the style when it first rendered would
 * never restore it when the user comes back to it.
 */
export function useStatusBarStyle(style: StatusBarStyle) {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style);
    }, [style]),
  );
}
