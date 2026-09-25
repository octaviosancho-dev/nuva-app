import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  BackButton,
  Button,
  CrestHeader,
  EyebrowPill,
  GrainOverlay,
  useEntrance,
} from '@/components/ui';
import { space, type as typeStyles } from '@/constants/tokens';
import { fetchInsights, markRead, type TodayInsight } from '@/lib/supabase/insights';
import { useTheme } from '@/lib/theme';

/** The artboard's crest, to its shoulders. It grows for a title that wraps to 3 lines. */
const MIN_HEADER = 248;
const HEADER_TOP = 58;
/** The crest's rule: the last baseline sits at least 20px above the shoulders. */
const HEADER_CLEARANCE = 22;

type Opened = (TodayInsight & { total: number }) | 'locked' | 'missing';

/**
 * An open insight, from `design/screens/InsightOpen.dc.html`.
 *
 * The body is `bodyLG` — the one style in the app tuned for continuous reading —
 * with the first paragraph in `text-primary` and the rest in `text-secondary`.
 * Paragraphs arrive on a 44ms stagger and then nothing on this screen moves
 * again: no idle Vera, no loop, nothing under text she is reading.
 *
 * The artboard also has a small Vera card with a "watch for" tip, as a fourth
 * block. The InsightCard spec caps an insight at three paragraphs and gives the
 * body to `bodyLG` alone, so the tip lives in the third paragraph instead, in
 * the same type as the rest.
 */
export default function InsightOpenScreen() {
  const { c } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [opened, setOpened] = useState<Opened | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [titleHeight, setTitleHeight] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void fetchInsights()
      .then((s) => {
        if (cancelled) return;
        if (s.today?.slug === slug) {
          setOpened({ ...s.today, total: s.total });
          return;
        }
        const past = s.read.find((r) => r.slug === slug);
        if (past) {
          setOpened({ ...past, read: true, reason: null, total: s.total });
          return;
        }
        // Reached by a link to one that has not unlocked yet, or that no longer
        // exists. Neither shows the body.
        setOpened(s.next?.slug === slug ? 'locked' : 'missing');
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/insights');
    }
  };

  const onMarkRead = async (id: string) => {
    setSaving(true);
    try {
      await markRead(id);
      leave();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  const insight = typeof opened === 'object' ? opened : null;
  const ready = insight !== null;

  const title = useEntrance(0, ready);
  const meta = useEntrance(1, ready);
  const action = useEntrance(5, ready);

  const headerHeight = Math.max(MIN_HEADER, HEADER_TOP + titleHeight + HEADER_CLEARANCE);

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={headerHeight} fill="night" bare>
        <View style={styles.headerInner}>
          <View onLayout={(e) => setTitleHeight(e.nativeEvent.layout.height)}>
            <View style={styles.nav}>
              <BackButton onPress={leave} />
              <View style={styles.spacer} />
              {insight ? (
                <EyebrowPill
                  label={`${insight.categoryLabel} · ${insight.position} of ${insight.total}`}
                  variant="onNight"
                />
              ) : null}
            </View>

            {insight ? (
              <>
                <Animated.View style={title}>
                  <Text style={[typeStyles.displayMD, { color: c.textOnNight }]}>
                    {insight.title}
                  </Text>
                </Animated.View>
                <Animated.View style={meta}>
                  <Text style={[typeStyles.caption, styles.meta, { color: c.textOnNightMuted }]}>
                    {insight.reason
                      ? `${insight.readingSeconds} seconds · surfaced from your last 7 days`
                      : `${insight.readingSeconds} seconds`}
                  </Text>
                </Animated.View>
              </>
            ) : null}
          </View>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error ? (
          <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text>
        ) : opened === null ? (
          <ActivityIndicator color={c.emberDeep} />
        ) : !insight ? (
          <Text style={[typeStyles.body, { color: c.textSecondary }]}>
            {opened === 'locked'
              ? 'This one unlocks tomorrow. One a day, so each has time to land.'
              : 'This insight is no longer here.'}
          </Text>
        ) : (
          insight.paragraphs.map((p, i) => <Paragraph key={i} text={p} index={i} />)
        )}

        <View style={styles.push} />

        {insight ? (
          <Animated.View style={[styles.action, action]}>
            {insight.read ? (
              <Button label="Back to insights" variant="secondary" onPress={leave} />
            ) : (
              <Button
                label="Mark as read"
                variant="secondary"
                icon={Check}
                loading={saving}
                onPress={() => void onMarkRead(insight.id)}
              />
            )}
          </Animated.View>
        ) : opened !== null && !error ? (
          <Button label="Back to insights" variant="secondary" onPress={leave} />
        ) : null}
      </ScrollView>

      <GrainOverlay />
    </View>
  );
}

function Paragraph({ text, index }: { text: string; index: number }) {
  const { c } = useTheme();
  const entrance = useEntrance(index + 1);
  return (
    <Animated.View style={entrance}>
      <Text
        style={[
          typeStyles.bodyLG,
          index > 0 ? styles.following : null,
          { color: index === 0 ? c.textPrimary : c.textSecondary },
        ]}
      >
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerInner: {
    flex: 1,
    paddingTop: HEADER_TOP,
    paddingHorizontal: space.space6,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
    marginBottom: space.space4,
  },
  spacer: {
    flex: 1,
  },
  meta: {
    marginTop: 10,
  },
  body: {
    flexGrow: 1,
    paddingTop: 26,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
  },
  following: {
    marginTop: space.space4,
  },
  push: {
    flex: 1,
    minHeight: space.space6,
  },
  action: {
    marginTop: space.space2,
  },
});
