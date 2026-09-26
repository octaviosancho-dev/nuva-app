import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  Button,
  CrestHeader,
  GrainOverlay,
  SeverityScale,
  icon as resolveIcon,
  useEntrance,
} from '@/components/ui';
import { alpha, category } from '@/constants/nuva';
import { color, opacity, radius, space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import { clearDraft, finishDraft, setSeverity, useDraft } from '@/lib/log/draft';
import { saveLog } from '@/lib/supabase/logs';
import { fetchValidations } from '@/lib/supabase/validation';
import { useTheme } from '@/lib/theme';

/**
 * One symptom at a time, from `design/screens/LogSeverity.dc.html`.
 *
 * The progress bar counts symptoms, not screens — she sees exactly how many
 * taps are left, which is what keeps the sixty seconds feeling finite. Each one
 * arrives already set to 2, so a symptom she agrees with costs one tap to pass.
 */
export default function LogSeverityScreen() {
  const { c } = useTheme();
  const draft = useDraft();
  const params = useLocalSearchParams<{ index?: string }>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const index = Math.max(0, Math.min(Number(params.index ?? 0), draft.length - 1));
  const entry = draft[index];

  const title = useEntrance(0);
  const support = useEntrance(1);
  const scale = useEntrance(2);

  // The draft was cleared, or this screen was reached directly. Nothing to rate.
  if (!entry) {
    return (
      <View style={[styles.screen, styles.empty, { backgroundColor: c.canvas }]}>
        <Text style={[typeStyles.body, { color: c.textSecondary }]}>
          Nothing to rate. Pick a symptom first.
        </Text>
        <Button label="Back to symptoms" variant="secondary" onPress={() => router.replace('/log')} />
      </View>
    );
  }

  const cat = category(entry.symptom.category);
  const Icon = resolveIcon(entry.symptom.icon);
  const last = index === draft.length - 1;

  const onBack = () => {
    if (index === 0) {
      router.replace('/log');
    } else {
      router.replace(`/log/severity?index=${index - 1}`);
    }
  };

  const onNext = async () => {
    if (!last) {
      router.replace(`/log/severity?index=${index + 1}`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveLog(draft.map((e) => ({ symptomId: e.symptom.id, severity: e.severity })));
      // The clock stops at the save, not at whichever screen comes after it.
      finishDraft();
      const ids = draft.map((e) => e.symptom.id);
      clearDraft();
      // The validation screen only when at least one symptom has a sourced
      // figure; otherwise straight to the confirmation, as before.
      const validations = await fetchValidations(ids).catch(() => []);
      router.replace(validations.length > 0 ? '/log/validation' : '/log/saved');
    } catch (e: unknown) {
      // Her taps are not lost — the draft survives and she can retry.
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={226} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack}
              hitSlop={6}
              style={({ pressed }) => [
                styles.back,
                pressed ? { opacity: opacity.pressed } : null,
              ]}
            >
              <ArrowLeft size={18} strokeWidth={2} color={c.textOnNight} />
            </Pressable>

            {/* One segment per symptom, so the end of the task is visible. */}
            <View style={styles.segments}>
              {draft.map((e, i) => (
                <View
                  key={e.symptom.id}
                  style={[
                    styles.segment,
                    {
                      backgroundColor:
                        i <= index ? c.textOnNight : alpha(color.light.textOnNight, 0.24),
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={[typeStyles.caption, styles.count, { color: c.textOnNightMuted }]}>
              {index + 1} of {draft.length}
            </Text>
          </View>

          <View style={styles.symptomRow}>
            <View
              style={[
                styles.disc,
                { backgroundColor: c[(cat?.token ?? 'catPhysical') as ColorToken] },
              ]}
            >
              <Icon size={24} strokeWidth={2} color={c[(cat?.on ?? 'onLuna') as ColorToken]} />
            </View>
            <View style={styles.symptomText}>
              <Text style={[typeStyles.displaySM, { color: c.textOnNight }]}>
                {entry.symptom.label}
              </Text>
              <Text style={[typeStyles.bodySM, { color: c.textOnNightMuted }]}>
                {cat?.label}
              </Text>
            </View>
          </View>
        </View>
      </CrestHeader>

      <View style={styles.body}>
        <Animated.View style={title}>
          <Text style={[typeStyles.displaySM, { color: c.textPrimary }]}>
            How much did it cost you?
          </Text>
        </Animated.View>

        <Animated.View style={[styles.support, support]}>
          <Text style={[typeStyles.bodySM, { color: c.textSecondary }]}>
            Colour, dots and the word all say the same thing. Pick the one that matches.
          </Text>
        </Animated.View>

        <Animated.View style={scale}>
          <SeverityScale
            value={entry.severity}
            onChange={(v) => setSeverity(entry.symptom.id, v)}
            symptom={entry.symptom.label}
          />
        </Animated.View>

        <View style={styles.spacer} />

        {error ? (
          <Text style={[typeStyles.bodySM, styles.error, { color: c.clay }]}>{error}</Text>
        ) : null}

        <Button
          label={last ? "Save today's log" : 'Next symptom'}
          loading={saving}
          onPress={() => void onNext()}
        />
      </View>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.space5,
    padding: space.space6,
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
    marginBottom: space.space4,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(color.light.textOnNight, 0.16),
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: radius.pill,
  },
  count: {
    fontVariant: ['tabular-nums'],
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  disc: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomText: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingTop: 28,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
  },
  support: {
    marginTop: space.space2,
    marginBottom: 22,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  error: {
    marginBottom: space.space3,
  },
});
