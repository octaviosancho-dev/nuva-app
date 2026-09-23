import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChartLine, House, PenLine, Plus, User, type LucideIcon } from 'lucide-react-native';

import { MOTION } from '@/constants/nuva';
import { radius, space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { ease } from './motion';

export type TabKey = 'today' | 'patterns' | 'words' | 'you';

/**
 * Four destinations and no more. Anything else belongs under You — the spec is
 * explicit that a fifth tab is how this bar stops working.
 *
 * Labels are always visible. An icon-only bar costs recognition for no real
 * space gain, and "Words" in particular is not guessable from a pen glyph.
 */
const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'today', label: 'Today', icon: House },
  { key: 'patterns', label: 'Patterns', icon: ChartLine },
  { key: 'words', label: 'Words', icon: PenLine },
  { key: 'you', label: 'You', icon: User },
];

export interface TabBarProps {
  active: TabKey;
  onNavigate: (key: TabKey) => void;
  /** The centre action. Logging is not a destination. */
  onLog: () => void;
  onDark?: boolean;
}

/**
 * The app's four destinations, with logging as a centre action rather than a
 * fifth tab — "logging is not a place, it is the thing she came to do". That is
 * why it is a 52px ember button carrying `shadow-ember` and the tabs are not:
 * the same one-glow-per-surface rule the primary button follows.
 *
 * Hidden through all of onboarding and the paywall. It appears once she is
 * inside the app.
 */
export function TabBar({ active, onNavigate, onLog, onDark = false }: TabBarProps) {
  const { c, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  const activeColor = onDark ? c.textOnNight : c.textPrimary;
  const inactiveColor = onDark ? c.textOnNightMuted : c.textTertiary;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: onDark ? c.night : c.surface,
          // The 20px bottom padding is for the home indicator. The inset is
          // added on top of it rather than replacing it, or the bar sits too
          // low on a device that has no indicator to clear.
          paddingBottom: styles.bar.paddingBottom + insets.bottom,
        },
        shadow.md,
      ]}
    >
      {TABS.slice(0, 2).map((tab) => (
        <Tab
          key={tab.key}
          tab={tab}
          active={active === tab.key}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
          onPress={() => onNavigate(tab.key)}
        />
      ))}

      <Pressable
        accessibilityRole="button"
        // A plus glyph is not a label.
        accessibilityLabel="Log symptoms"
        onPress={onLog}
        style={[styles.log, { backgroundColor: c.ember }, shadow.ember]}
      >
        <Plus size={24} strokeWidth={2} color={c.onEmber} />
      </Pressable>

      {TABS.slice(2).map((tab) => (
        <Tab
          key={tab.key}
          tab={tab}
          active={active === tab.key}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
          onPress={() => onNavigate(tab.key)}
        />
      ))}
    </View>
  );
}

interface TabProps {
  tab: (typeof TABS)[number];
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
}

function Tab({ tab, active, activeColor, inactiveColor, onPress }: TabProps) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const pop = useSharedValue(1);
  const label = useSharedValue(active ? 1 : 0.6);

  useEffect(() => {
    if (reduced) {
      label.value = active ? 1 : 0.6;
      return;
    }
    label.value = withTiming(active ? 1 : 0.6, {
      duration: MOTION.duration.quick,
      easing: ease.standard,
    });
    if (active) {
      pop.value = withSequence(
        withSpring(1.12, MOTION.spring.press),
        withSpring(1, MOTION.spring.press),
      );
    }
  }, [active, reduced, pop, label]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: label.value }));

  const Icon = tab.icon;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.label}
      onPress={onPress}
      style={styles.tab}
    >
      <Animated.View style={reduced ? undefined : iconStyle}>
        <Icon size={23} strokeWidth={2} color={active ? activeColor : inactiveColor} />
      </Animated.View>

      <Animated.Text
        style={[
          typeStyles.label,
          { color: active ? activeColor : inactiveColor },
          reduced ? undefined : labelStyle,
        ]}
      >
        {tab.label}
      </Animated.Text>

      {/*
        The dot's 4px is reserved whether or not the tab is active, so switching
        tabs never shifts the labels above it.
      */}
      <View style={[styles.dot, active ? { backgroundColor: c.ember } : null]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: space.space3,
    paddingHorizontal: 10,
    paddingBottom: space.space5,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    zIndex: 6,
  },
  tab: {
    flex: 1,
    minWidth: 56,
    alignItems: 'center',
    gap: 3,
  },
  log: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: space.space1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
  },
});
