import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import {
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ensureSession } from '@/lib/supabase/session';
import { useTheme } from '@/lib/theme';

/**
 * Four cuts, and only four. Fraunces 600 is the display voice and 500 italic is
 * the `quote` style; DM Sans 400 and 500 are the interface, and 500 is the
 * heaviest text weight that exists in this app.
 */
const FONTS = {
  Fraunces_600SemiBold,
  Fraunces_500Medium_Italic,
  DMSans_400Regular,
  DMSans_500Medium,
};

/**
 * The native splash holds until the fonts resolve. Fraunces has very different
 * metrics from the system serif fallback and the headlines visibly reflow if we
 * render early — which is exactly the first impression this product cannot
 * afford.
 */
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONTS);
  const { c, isDark } = useTheme();

  useEffect(() => {
    // Hide on error too. A font CDN failure must not strand the app on the
    // splash forever — a reflowed headline beats a dead launch.
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    /**
     * Establish an identity once, for the whole app. Deliberately not awaited:
     * onboarding runs entirely on local storage, so a slow or missing network
     * must not hold up the first screen. The session arrives when it arrives,
     * and the screens that need it read it through `useSession`.
     */
    void ensureSession();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: c.canvas },
            // The crest is what carries continuity between onboarding screens,
            // so the navigator itself must not slide a second surface over it.
            animation: 'fade',
            animationDuration: 240,
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
