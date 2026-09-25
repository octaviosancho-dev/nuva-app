import { router, useFocusEffect } from 'expo-router';
import { ArrowRight, Eye, FileText, Info, Share } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  BackButton,
  Button,
  CrestHeader,
  EyebrowPill,
  GrainOverlay,
  ListRow,
  useEntrance,
} from '@/components/ui';
import { radius, space, type as typeStyles } from '@/constants/tokens';
import { exportReport, previewReport } from '@/lib/report/export';
import {
  currentMonth,
  fetchMonthSummary,
  fetchPastMonths,
  type Month,
  type MonthListing,
  type MonthSummary,
} from '@/lib/report/summary';
import { useTheme } from '@/lib/theme';

/** "1 October" — the day the month in progress becomes a finished one. */
function readyOn(m: Month): string {
  return new Date(m.year, m.month, 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

const monthName = (m: Month) =>
  new Date(m.year, m.month - 1, 1).toLocaleDateString('en-GB', { month: 'long' });

type Busy = { month: Month; action: 'preview' | 'export' } | null;

/**
 * The Health Report, from `design/screens/Report.dc.html`.
 *
 * Present, functional, not celebrated — the brief demoted it on purpose. The
 * screen says so itself: the PDF is for a specialist, and the note at the
 * bottom sends her to Find Your Words for a ten-minute GP appointment.
 *
 * Every report is rebuilt on the phone from her logs when she asks for it. The
 * artboard's "PDF, 3 pages" on a past month would need a stored copy; there is
 * none, so past months say how many days they hold instead.
 */
export default function ReportScreen() {
  const { c, shadow } = useTheme();
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [past, setPast] = useState<MonthListing[]>([]);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void Promise.all([fetchMonthSummary(currentMonth()), fetchPastMonths()])
        .then(([s, p]) => {
          if (cancelled) return;
          setSummary(s);
          setPast(p);
        })
        .catch((e: unknown) => {
          if (!cancelled) setError(e instanceof Error ? e.message : String(e));
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
      router.replace('/(app)/you');
    }
  };

  const run = async (month: Month, action: 'preview' | 'export') => {
    if (busy) return;
    setBusy({ month, action });
    setError(null);
    try {
      if (action === 'preview') await previewReport(month);
      else await exportReport(month);
    } catch (e: unknown) {
      // Closing the iOS print sheet without printing rejects; that is her
      // changing her mind, not an error.
      const message = e instanceof Error ? e.message : String(e);
      if (!/cancel|dismiss/i.test(message)) setError(message);
    } finally {
      setBusy(null);
    }
  };

  const isBusy = (m: Month, action: 'preview' | 'export') =>
    busy?.action === action && busy.month.year === m.year && busy.month.month === m.month;

  const ready = summary !== null;
  const card = useEntrance(0, ready);
  const list = useEntrance(1, ready);
  const note = useEntrance(2, ready);
  const words = useEntrance(3, ready);

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={187} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <BackButton onPress={leave} />
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
              Health report
            </Text>
          </View>
          <Text style={[typeStyles.bodySM, { color: c.textOnNightMuted }]}>
            A summary for a specialist. The words are what you bring to a GP.
          </Text>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error ? <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text> : null}

        {!summary ? (
          error ? null : <ActivityIndicator color={c.emberDeep} />
        ) : (
          <>
            <Animated.View style={[styles.card, { backgroundColor: c.surface }, shadow.sm, card]}>
              <View style={styles.cardHead}>
                <EyebrowPill label="In progress" variant="onLight" />
                <Text style={[typeStyles.caption, { color: c.textSecondary }]}>
                  Ready {readyOn(summary.month)}
                </Text>
              </View>

              <Text style={[typeStyles.displaySM, styles.month, { color: c.textPrimary }]}>
                {monthName(summary.month)}
              </Text>
              <Text style={[typeStyles.bodySM, styles.stats, { color: c.textSecondary }]}>
                {summary.daysLogged} of {summary.daysInMonth} days logged · {summary.symptomCount}{' '}
                {summary.symptomCount === 1 ? 'symptom' : 'symptoms'}
                {summary.meanSeverity !== null
                  ? ` · mean severity ${summary.meanSeverity.toFixed(1)}`
                  : ''}
              </Text>

              {/*
                Days logged against days in the month. `ember` is a fill here,
                never text — and the empty part is sunken, not red: a day she
                didn't log is blank, not a failure.
              */}
              <View
                style={styles.bar}
                accessible
                accessibilityLabel={`${summary.daysLogged} of ${summary.daysInMonth} days logged`}
              >
                {summary.daysLogged > 0 ? (
                  <View style={[styles.segment, { flex: summary.daysLogged, backgroundColor: c.ember }]} />
                ) : null}
                {summary.daysInMonth - summary.daysLogged > 0 ? (
                  <View
                    style={[
                      styles.segment,
                      { flex: summary.daysInMonth - summary.daysLogged, backgroundColor: c.surfaceSunken },
                    ]}
                  />
                ) : null}
              </View>

              <View style={styles.actions}>
                <Button
                  label="Preview"
                  icon={Eye}
                  variant="secondary"
                  compact
                  loading={isBusy(summary.month, 'preview')}
                  onPress={() => void run(summary.month, 'preview')}
                />
                <Button
                  label="Export PDF"
                  icon={Share}
                  variant="secondary"
                  compact
                  loading={isBusy(summary.month, 'export')}
                  onPress={() => void run(summary.month, 'export')}
                />
              </View>
            </Animated.View>

            {past.length > 0 ? (
              <Animated.View style={[styles.list, list]}>
                {past.map((p) => (
                  <ListRow
                    key={p.label}
                    icon={FileText}
                    tint={c.sand}
                    // "August" this year, "December 2025" once it is another year.
                    title={p.month.year === summary.month.year ? monthName(p.month) : p.label}
                    subtitle={
                      isBusy(p.month, 'export')
                        ? 'Building the PDF…'
                        : `${p.daysLogged} ${p.daysLogged === 1 ? 'day' : 'days'} logged · export PDF`
                    }
                    onPress={() => void run(p.month, 'export')}
                  />
                ))}
              </Animated.View>
            ) : null}

            <Animated.View style={[styles.note, { backgroundColor: c.surfaceSunken }, note]}>
              <Info size={20} strokeWidth={2} color={c.textSecondary} />
              <Text style={[typeStyles.bodySM, styles.noteText, { color: c.textSecondary }]}>
                A PDF is useful for a menopause specialist. For a ten-minute GP appointment, take the
                words instead.
              </Text>
            </Animated.View>

            <View style={styles.push} />

            <Animated.View style={words}>
              <Button
                label="Open find your words"
                icon={ArrowRight}
                variant="secondary"
                onPress={() => router.navigate('/(app)/words')}
              />
            </Animated.View>
          </>
        )}
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
    marginBottom: 10,
  },
  title: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingTop: 22,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
    gap: 14,
  },
  card: {
    borderRadius: radius.xl,
    padding: space.space5,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  month: {
    marginTop: space.space3,
  },
  stats: {
    marginTop: 6,
  },
  bar: {
    flexDirection: 'row',
    gap: space.space1,
    marginTop: 14,
  },
  segment: {
    height: 6,
    borderRadius: radius.pill,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  list: {
    gap: 14,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: radius.lg,
    paddingVertical: space.space4,
    paddingHorizontal: 18,
  },
  noteText: {
    flex: 1,
  },
  push: {
    flex: 1,
  },
});
