import { StyleSheet, Text, View } from 'react-native';

import { GrainOverlay } from '@/components/ui';
import { space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';

export interface UnbuiltProps {
  /** The destination's name, as the tab bar labels it. */
  title: string;
  /** What will live here, in one plain sentence. */
  summary: string;
  /** Which milestone builds it. */
  milestone: string;
}

/**
 * **Scaffolding. Delete each use as its milestone lands.**
 *
 * The tab bar has four destinations and Expo Router needs a route behind each
 * one or the shell cannot mount. Three of them are not built yet.
 *
 * This is not an empty state and must never be mistaken for one: an empty state
 * is a real screen with no data, and it ships. This says the screen does not
 * exist, and it does not ship — the app is not releasable while any of these is
 * still reachable.
 *
 * It says what will be there rather than "coming soon", because a placeholder
 * that tells you nothing is worse than one that does.
 */
export function Unbuilt({ title, summary, milestone }: UnbuiltProps) {
  const { c } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <View style={styles.centre}>
        <Text style={[typeStyles.displaySM, { color: c.textPrimary }]}>{title}</Text>
        <Text style={[typeStyles.body, styles.summary, { color: c.textSecondary }]}>
          {summary}
        </Text>
        <Text style={[typeStyles.caption, styles.milestone, { color: c.textTertiary }]}>
          Not built yet · {milestone}
        </Text>
      </View>
      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.space6,
    paddingBottom: 120,
  },
  summary: {
    marginTop: space.space3,
    textAlign: 'center',
  },
  milestone: {
    marginTop: space.space5,
  },
});
