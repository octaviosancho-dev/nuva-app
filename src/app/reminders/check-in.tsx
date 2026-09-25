import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CHECK_IN_OPTIONS } from '@/components/onboarding/checkInOptions';
import { OptionList } from '@/components/onboarding/OptionList';
import { BackButton, CrestHeader, GrainOverlay } from '@/components/ui';
import { space, type as typeStyles } from '@/constants/tokens';
import { applyReminders } from '@/lib/notifications/reminders';
import { fetchProfile, setReminderHour } from '@/lib/supabase/profile';
import { useTheme } from '@/lib/theme';

/**
 * Changing the daily check-in — the same four choices as Q6, so the setting
 * she edits is the one she made on day one. There is no artboard for it; it
 * reuses Q6's options and the Reminders header.
 *
 * A choice saves on tap and returns, like Q6. "I would rather not be reminded"
 * is honoured literally: nothing daily is sent until she comes back here.
 */
export default function CheckInScreen() {
  const { c } = useTheme();
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void fetchProfile().then((p) => {
        if (cancelled) return;
        const index = CHECK_IN_OPTIONS.findIndex((o) => o.reminderHour === (p?.reminderHour ?? null));
        setSelected(index >= 0 ? index : null);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/reminders');
    }
  };

  const choose = async (index: number) => {
    const option = CHECK_IN_OPTIONS[index];
    if (!option) return;
    setSelected(index);
    setError(null);
    try {
      await setReminderHour(option.reminderHour);
      await applyReminders({ requestPermission: option.reminderHour !== null });
      leave();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={168} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <BackButton onPress={leave} />
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
              Daily check-in
            </Text>
          </View>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[typeStyles.body, { color: c.textSecondary }]}>
          When do you want to check in?
        </Text>
        {error ? <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text> : null}
        <OptionList options={CHECK_IN_OPTIONS} selected={selected} onSelect={(i) => void choose(i)} />
      </ScrollView>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerInner: {
    flex: 1,
    paddingTop: 58,
    paddingHorizontal: space.space6,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
  },
  title: {
    flex: 1,
  },
  body: {
    paddingTop: 22,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
    gap: space.space4,
  },
});
