import { router, Tabs, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { TabBar, type TabKey } from '@/components/ui';
import { startDraft } from '@/lib/log/draft';
import { syncOnboarding } from '@/lib/supabase/profile';
import { useTheme } from '@/lib/theme';

/**
 * The app shell — everything after onboarding and the paywall.
 *
 * The tab bar lives here and nowhere else, which is what keeps it off the quiz,
 * the magic moment and the paywall. It appears once she is inside.
 */
export default function AppLayout() {
  const { c } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    // Her onboarding answers and profile, up to Supabase, every time she
    // enters. Idempotent, and never allowed to block or break the app shell.
    void syncOnboarding().catch((e: unknown) => {
      console.warn('[nuva] onboarding sync failed:', e instanceof Error ? e.message : e);
    });
  }, []);

  const active: TabKey = pathname.includes('/patterns')
    ? 'patterns'
    : pathname.includes('/words')
      ? 'words'
      : pathname.includes('/you')
        ? 'you'
        : 'today';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.canvas },
      }}
      tabBar={() => (
        <TabBar
          active={active}
          onNavigate={(key) => router.navigate(`/(app)/${key}`)}
          onLog={() => {
            // The clock starts when the tracker opens — see the draft store.
            startDraft();
            router.push('/log');
          }}
        />
      )}
    >
      <Tabs.Screen name="today" />
      <Tabs.Screen name="patterns" />
      <Tabs.Screen name="words" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
