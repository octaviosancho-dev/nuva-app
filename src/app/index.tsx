import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { SplashLockup } from '@/components/art/Logo';
import { GrainOverlay } from '@/components/ui';
import { color } from '@/constants/tokens';

const GLOW_SIZE = 340;

/**
 * The splash. `night-deep`, the deepest ground in the system, with the mark
 * opening its wings over an ember glow — the light the moth is moving toward.
 *
 * The native splash (configured in `app.json`) covers the font load; this route
 * takes over once `_layout` hides it, runs the 800ms open, holds 400ms and
 * hands off. It never repeats within a session, because it is a route we
 * `replace` rather than a screen we can navigate back to.
 */
export default function SplashRoute() {
  const onFinished = useCallback(() => {
    router.replace('/welcome');
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.centre}>
        {/* The glow sits behind the mark, not around it — a radial that fades
            to nothing by 70%, so it reads as light rather than as a disc. */}
        <Svg width={GLOW_SIZE} height={GLOW_SIZE} style={styles.glow} pointerEvents="none">
          <Defs>
            <RadialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color.light.ember} stopOpacity={0.5} />
              <Stop offset="70%" stopColor={color.light.ember} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={GLOW_SIZE} height={GLOW_SIZE} fill="url(#splashGlow)" />
        </Svg>

        <SplashLockup onNight onFinished={onFinished} />
      </View>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.light.nightDeep,
  },
  centre: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
});
