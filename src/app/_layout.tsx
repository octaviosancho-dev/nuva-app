import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import {
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { startDraft } from '@/lib/log/draft';
import type { ReminderUrl } from '@/lib/notifications/reminders';
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

if (Platform.OS !== 'web') {
  // A reminder that arrives while she is in the app still shows as a banner,
  // silently — no sound, no badge. The badge would be a count of things she
  // "owes", and nothing in this app is owed.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Opens the screen a reminder is about. Unknown URLs are ignored, not guessed. */
function openFromNotification(response: Notifications.NotificationResponse | null): void {
  const url = response?.notification.request.content.data?.url as ReminderUrl | undefined;
  switch (url) {
    case '/log':
      // The tracker's 60-second clock starts when it opens, however it opens.
      startDraft();
      router.push('/log');
      break;
    case '/insights':
      router.push('/insights');
      break;
    case '/meds':
      router.push('/meds');
      break;
    case '/report':
      router.push('/report');
      break;
    default:
      break;
  }
}

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

  useEffect(() => {
    if (Platform.OS === 'web' || (!fontsLoaded && !fontError)) return;
    // A tap that launched the app from cold, then every tap after.
    // Cleared once handled, or every later launch would reopen the same screen.
    void Notifications.getLastNotificationResponseAsync().then((last) => {
      if (!last) return;
      openFromNotification(last);
      void Notifications.clearLastNotificationResponseAsync();
    });
    const sub = Notifications.addNotificationResponseReceivedListener(openFromNotification);
    return () => sub.remove();
  }, [fontsLoaded, fontError]);

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
