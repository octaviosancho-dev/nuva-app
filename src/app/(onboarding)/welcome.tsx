import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { NuvaLockup } from '@/components/art/Logo';
import { Vera } from '@/components/art/Vera';
import {
  Button,
  CrestHeader,
  EyebrowPill,
  GrainOverlay,
  TextLink,
  useEntrance,
} from '@/components/ui';
import { space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';

/**
 * Onboarding 1 of 8 — welcome, from `design/screens/Main.dc.html`.
 *
 * A `hero` crest on `night-deep`, which is the colour of 11pm: the entry moment
 * is a woman googling her symptoms at that hour, and the screen meets her
 * there rather than in a bright clinic.
 *
 * Vera is 188px here. Above 220 she becomes the subject of the screen, which is
 * only correct on this screen and the magic moment — so this is deliberately
 * just under that line.
 */
export default function WelcomeScreen() {
  const { c } = useTheme();

  const logo = useEntrance(0);
  const vera = useEntrance(2);
  const eyebrow = useEntrance(4);
  const headline = useEntrance(5);
  const lead = useEntrance(6);
  const cta = useEntrance(7);

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="hero" height={452} fill="nightDeep" style={styles.header} bare>
        <View style={styles.headerInner}>
          <Animated.View style={logo}>
            <NuvaLockup width={97} onNight />
          </Animated.View>

          <Animated.View style={[styles.veraRow, vera]}>
            <Vera pose="neutral" size={188} breathe />
          </Animated.View>

          <Animated.View style={[styles.eyebrowRow, eyebrow]}>
            <EyebrowPill label="Welcome" variant="onNight" />
          </Animated.View>

          <Animated.View style={headline}>
            <Text style={[typeStyles.displayLG, styles.headline, { color: c.textOnNight }]}>
              Something changed.{'\n'}Let&rsquo;s name it.
            </Text>
          </Animated.View>
        </View>
      </CrestHeader>

      <View style={styles.body}>
        <Animated.View style={lead}>
          <Text style={[typeStyles.body, { color: c.textSecondary }]}>
            Anxiety out of nowhere. Cycles that make no sense. Brain fog at 3pm. There is a
            reason, and it has a name.
          </Text>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View style={cta}>
          <Button label="Start" icon={ArrowRight} onPress={() => router.push('/q1')} />
        </Animated.View>

        <View style={styles.accountRow}>
          {/*
            Ink rather than `text-link`: this sits on `canvas` under an ember
            button, and a second warm accent directly beneath the one important
            tap would compete with it.
          */}
          <TextLink
            label="I already have an account"
            color={c.textPrimary}
            onPress={() => router.push('/q1')}
          />
        </View>
      </View>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    // The block sizes itself; the crest's 30px bulge is added by CrestHeader.
  },
  headerInner: {
    flex: 1,
    paddingTop: 58,
    paddingHorizontal: space.space6,
  },
  veraRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  eyebrowRow: {
    marginTop: 2,
  },
  headline: {
    marginTop: 12,
  },
  body: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
  },
  spacer: {
    flex: 1,
  },
  accountRow: {
    alignItems: 'center',
    marginTop: 18,
  },
});
