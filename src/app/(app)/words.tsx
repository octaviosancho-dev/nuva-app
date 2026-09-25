import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { Quote } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CrestHeader, GrainOverlay, WordsCard, useEntrance } from '@/components/ui';
import { radius, space, type as typeStyles } from '@/constants/tokens';
import { track } from '@/lib/analytics';
import { generateWords, type Words } from '@/lib/supabase/words';
import { recordWordsCopied } from '@/lib/supabase/you';
import { useTheme } from '@/lib/theme';

/**
 * Find Your Words, from `design/screens/Words.dc.html`.
 *
 * This replaced the Health Report PDF as the primary doctor-visit feature. The
 * PDF was never the answer to being dismissed — she does not need a chart in a
 * ten-minute appointment, she needs sentences.
 *
 * Regenerated on every open and never cached, because her data moved since last
 * time. The header says so rather than leaving her to wonder whether what she
 * is about to read is current.
 */
export default function WordsScreen() {
  const { c } = useTheme();
  const [words, setWords] = useState<Words | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      track('find_your_words_opened');
      void generateWords()
        .then((w) => {
          if (cancelled) return;
          setWords(w);
          setLoading(false);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const note = useEntrance(3);

  const onCopy = () => {
    if (!words) return;
    void Clipboard.setStringAsync(words.sentences.join(' '));
    // Counted for the You screen. A failed count must not look like a failed
    // copy, so it is fire-and-forget.
    void recordWordsCopied().catch(() => undefined);
    track('find_your_words_copied');
    // One of the three events allowed to vibrate — see design/motion.md.
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={196} fill="night" bare>
        <View style={styles.headerInner}>
          <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
            Find your words
          </Text>
          <Text style={[typeStyles.bodySM, { color: c.textOnNightMuted }]}>
            {words
              ? `Generated from your last ${words.loggedDays} logged days. Regenerated every time you open this.`
              : 'Generated from your own log, every time you open this.'}
          </Text>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error ? (
          <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text>
        ) : loading ? (
          <ActivityIndicator color={c.emberDeep} />
        ) : !words ? (
          <View style={[styles.empty, { backgroundColor: c.surface }]}>
            <Text style={[typeStyles.body, { color: c.textSecondary }]}>
              Nothing logged yet. The sentences are built from your own days, so they need a
              few before they are worth taking anywhere.
            </Text>
          </View>
        ) : (
          <WordsCard sentences={words.sentences} onCopy={onCopy} />
        )}

        <Animated.View
          style={[styles.note, { backgroundColor: c.surfaceSunken }, note]}
        >
          <Quote size={18} strokeWidth={2} color={c.textSecondary} />
          <Text style={[typeStyles.bodySM, styles.noteText, { color: c.textSecondary }]}>
            &ldquo;Vasomotor symptoms&rdquo; is the phrase that makes a physician listen. It is
            deliberate, and it is yours to use.
          </Text>
        </Animated.View>
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
  title: {
    marginBottom: 14,
  },
  body: {
    paddingTop: 22,
    paddingHorizontal: space.space6,
    // Clears the tab bar.
    paddingBottom: 120,
  },
  empty: {
    borderRadius: radius.xl,
    padding: space.space5,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: radius.lg,
    paddingVertical: space.space4,
    paddingHorizontal: 18,
    marginTop: space.space4,
  },
  noteText: {
    flex: 1,
  },
});
