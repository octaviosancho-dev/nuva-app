import { router, useFocusEffect } from 'expo-router';
import { BellRing, FileText, Lightbulb, Pill } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { NuvaMark } from '@/components/art/Logo';
import {
  BackButton,
  CrestHeader,
  GrainOverlay,
  ListRow,
  Toggle,
  useEntrance,
} from '@/components/ui';
import { radius, space, type as typeStyles } from '@/constants/tokens';
import { applyReminders, REMINDER_COPY, type ReminderStatus } from '@/lib/notifications/reminders';
import { readPreferences, savePreference, type Preferences } from '@/lib/storage/preferences';
import { fetchMedications, type Medication } from '@/lib/supabase/medications';
import { fetchProfile } from '@/lib/supabase/profile';
import { useTheme } from '@/lib/theme';

const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;

/**
 * Reminders, from `design/screens/Reminders.dc.html`.
 *
 * Four switches' worth of control over what the phone says to her, and a
 * preview of exactly what it says — the copy under "What we send" is the copy
 * the notifications carry, read from the same place.
 *
 * Turning the daily check-in off stops everything except the medication
 * reminders she set on each medication herself. The artboard's footnote says
 * "no reminder is ever sent"; with HRT reminders firing on their own schedule
 * that would not be true, so the line says what actually happens.
 */
export default function RemindersScreen() {
  const { c } = useTheme();
  const [hour, setHour] = useState<number | null | undefined>(undefined);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [prefs, setPrefs] = useState<Preferences>(() => readPreferences());
  const [status, setStatus] = useState<ReminderStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void Promise.all([fetchProfile(), fetchMedications()])
        .then(([profile, m]) => {
          if (cancelled) return;
          setHour(profile?.reminderHour ?? null);
          setMeds(m);
        })
        .catch(() => {
          if (!cancelled) setHour(null);
        });
      // Re-plan on the way in, so the status line is about what is scheduled now.
      void applyReminders().then((s) => {
        if (!cancelled) setStatus(s);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const toggle = (key: keyof Preferences, value: boolean) => {
    setPrefs(savePreference(key, value));
    void applyReminders({ requestPermission: true }).then(setStatus);
  };

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/you');
    }
  };

  const ready = hour !== undefined;
  const rows = useEntrance(0, ready);
  const previews = useEntrance(1, ready);

  const medHours = [...new Set(meds.map((m) => m.reminderHour).filter((h): h is number => h !== null))].sort(
    (a, b) => a - b,
  );
  const withReminder = meds.find((m) => m.reminderHour !== null) ?? null;
  const off = hour === null;
  const daily = prefs.insightReminder ? REMINDER_COPY.insight() : REMINDER_COPY.checkIn();

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={168} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <BackButton onPress={leave} />
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>Reminders</Text>
          </View>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {status === 'denied' ? (
          <Text style={[typeStyles.bodySM, { color: c.textSecondary }]}>
            Notifications are off for Nuva in your phone&rsquo;s settings, so nothing can arrive. Turn
            them on there and these choices take effect.
          </Text>
        ) : null}
        {Platform.OS === 'web' ? (
          <Text style={[typeStyles.caption, { color: c.textTertiary }]}>
            Reminders are scheduled on the phone. Here your choices are saved, and nothing is sent.
          </Text>
        ) : null}

        <Animated.View style={[styles.stack, rows]}>
          <ListRow
            icon={BellRing}
            tint={c.emberSoft}
            title="Daily check-in"
            subtitle={
              hour === undefined ? ' ' : off ? 'Off. Nothing is sent.' : `${hh(hour)} · every day`
            }
            onPress={() => router.push('/reminders/check-in')}
          />
          <ListRow
            icon={Pill}
            tint={c.lunaSoft}
            title="HRT reminder"
            subtitle={
              medHours.length
                ? `${medHours.map(hh).join(', ')} · fires on its own schedule`
                : 'Set on each medication'
            }
            onPress={() => router.push('/meds')}
          />
          <ListRow
            icon={Lightbulb}
            tint={c.sand}
            title="Insight unlocked"
            trailing={
              <Toggle
                value={prefs.insightReminder && !off}
                disabled={off}
                onValueChange={(v) => toggle('insightReminder', v)}
                accessibilityLabel="Insight unlocked"
              />
            }
          />
          <ListRow
            icon={FileText}
            tint={c.claySoft}
            title="Report ready"
            trailing={
              <Toggle
                value={prefs.reportReminder && !off}
                disabled={off}
                onValueChange={(v) => toggle('reportReminder', v)}
                accessibilityLabel="Report ready"
              />
            }
          />
        </Animated.View>

        <Text style={[typeStyles.eyebrow, styles.section, { color: c.textTertiary }]}>WHAT WE SEND</Text>

        <Animated.View style={[styles.stack, previews]}>
          {!off && hour !== undefined ? (
            <Preview
              time={hh(hour)}
              title={String(daily.title)}
              body={String(daily.body)}
              background={c.surface}
            />
          ) : null}
          {withReminder?.reminderHour != null ? (
            <Preview
              time={hh(withReminder.reminderHour)}
              title={String(
                REMINDER_COPY.medication(withReminder.name, withReminder.dose, withReminder.rotationNotes)
                  .title,
              )}
              body={String(
                REMINDER_COPY.medication(withReminder.name, withReminder.dose, withReminder.rotationNotes)
                  .body,
              )}
              background={c.lunaSoft}
            />
          ) : null}

          <Text style={[typeStyles.caption, styles.foot, { color: c.textTertiary }]}>
            Turn the daily check-in off and nothing is sent but the medication reminders you set
            yourself. That setting is honoured, not softened.
          </Text>
        </Animated.View>
      </ScrollView>

      <GrainOverlay />
    </View>
  );
}

/** A notification as it lands on the lock screen, drawn in the app's own type. */
function Preview({
  time,
  title,
  body,
  background,
}: {
  time: string;
  title: string;
  body: string;
  background: string;
}) {
  const { c } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`Example notification at ${time}: ${title} ${body}`}
      style={[styles.preview, { backgroundColor: background }]}
    >
      <View style={styles.previewHead}>
        <View style={styles.brand}>
          <NuvaMark size={16} />
          <Text style={[typeStyles.eyebrow, { color: c.textSecondary }]}>NUVA</Text>
        </View>
        <Text style={[typeStyles.caption, { color: c.textTertiary }]}>{time}</Text>
      </View>
      <Text style={[typeStyles.labelLG, styles.previewTitle, { color: c.textPrimary }]}>{title}</Text>
      <Text style={[typeStyles.bodySM, styles.previewBody, { color: c.textSecondary }]}>{body}</Text>
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
    gap: space.space3,
  },
  stack: {
    gap: space.space3,
  },
  section: {
    marginTop: 14,
  },
  preview: {
    borderRadius: radius.lg,
    paddingVertical: space.space4,
    paddingHorizontal: 18,
  },
  previewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space2,
  },
  previewTitle: {
    marginTop: 10,
  },
  previewBody: {
    marginTop: space.space1,
  },
  foot: {
    marginTop: 6,
  },
});
