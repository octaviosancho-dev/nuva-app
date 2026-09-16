import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { AudienceBadge } from '@/components/onboarding/AudienceBadge';
import {
  ArchHeader,
  GrainOverlay,
  PrimaryButton,
  TextLink,
  useStatusBarStyle,
} from '@/components/ui';
import { artColor, color, layout, screen, space } from '@/constants/tokens';
import { accent, type } from '@/constants/typography';

const heroProfile = require<ImageSourcePropType>('@/assets/illustrations/hero-profile.jpg');

/**
 * Onboarding screen 1 of 8 — DESIGN_SYSTEM.md §7.
 *
 * One loud thing: a 452px plum arch carrying the artwork, the wordmark and the
 * audience badge. Everything below it is quiet and functional.
 */
export default function WelcomeScreen() {
  useStatusBarStyle('light');

  const onBegin = () => {
    router.push('/q1');
  };

  const onSignIn = () => {
    // Apple and Google sign-in arrive with Supabase auth (milestone 4).
  };

  return (
    <View style={styles.screen}>
      <ArchHeader
        backgroundColor={artColor.heroPlum}
        depth="hero"
        height={screen.welcome.headerHeight}
        halftone="cream"
        paddingBottom={0}
        style={styles.header}
      >
        {/* Square art, full width, anchored to the block's bottom so the arch
            cuts its lower corners. Its background is heroPlum, so there is no seam. */}
        <Image source={heroProfile} style={styles.hero} contentFit="cover" />

        <Text style={[type.wordmark, styles.wordmark]}>nuva</Text>
        <AudienceBadge label="35–45 · perimenopause" style={styles.badge} />
      </ArchHeader>

      <View style={styles.lead}>
        <Text style={type.displayXL}>
          Your body is{'\n'}
          <Text style={accent(color.brick)}>changing.</Text>
        </Text>

        <View style={styles.leadGap} />

        <Text style={[type.bodyLG, styles.leadCopy]}>
          Anxiety, brain fog, broken sleep. For the first time, you’ll understand why.
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <PrimaryButton label="Let’s begin" size="hero" onPress={onBegin} />
        <View style={styles.footerGap} />
        <TextLink label="I already have an account" onPress={onSignIn} />
      </View>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.cream,
  },
  header: {
    // Nothing in this header flows — the wordmark and badge are placed against
    // the block's own edges, so the standard header padding would only confuse
    // their offsets.
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  hero: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    aspectRatio: 1,
  },
  wordmark: {
    position: 'absolute',
    top: screen.welcome.wordmarkTop,
    left: layout.gutter,
  },
  badge: {
    position: 'absolute',
    top: screen.welcome.badgeTop,
    right: layout.gutter,
  },
  lead: {
    paddingTop: space['6xl'],
    paddingHorizontal: layout.gutter,
  },
  leadGap: {
    height: space.xl,
  },
  leadCopy: {
    maxWidth: screen.welcome.leadMaxWidth,
  },
  spacer: {
    flex: 1,
    minHeight: space['2xl'],
  },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingBottom: layout.screenBottom,
  },
  footerGap: {
    height: space['2xl'],
  },
});
