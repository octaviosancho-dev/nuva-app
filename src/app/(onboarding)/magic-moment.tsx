import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Animated from 'react-native-reanimated';

import { GrainOverlay, PrimaryButton, useEntrance, useStatusBarStyle } from '@/components/ui';
import { artColor, color, layout, screen, space, text } from '@/constants/tokens';
import { accent, type } from '@/constants/typography';

const bloomFull = require<ImageSourcePropType>('@/assets/illustrations/bloom-full.jpg');

/**
 * Onboarding screen 8 of 8 — the magic moment.
 *
 * §7: breaks the pattern completely. No arch, no progress, no back button, no
 * eyebrow. Full-bleed `magicPlum`, `displayXL` in cream, arriving line by line.
 * Give it more air than feels comfortable.
 *
 * The copy is PRODUCT_BRIEF.md §1 verbatim. For many users this is the first
 * time anyone — human or software — has validated what they are experiencing.
 * It is not a feature; it is the reason someone pays.
 *
 * The artwork is a callback, not a new subject: the welcome screen's woman with
 * Q1's bare twig grown into full bloom. That rhyme is the payoff of the whole
 * flow (§6) — it is never replaced with an unrelated illustration.
 */
export default function MagicMomentScreen() {
  useStatusBarStyle('light');

  // Three groups, the §8 maximum. The screen's only animation.
  const lead = useEntrance(0);
  const headline = useEntrance(1);
  const closing = useEntrance(2);

  const onContinue = () => {
    router.push('/paywall');
  };

  return (
    <View style={styles.screen}>
      {/* Anchored to the lower half and bleeding to both edges, so its height
          follows from the screen width. Its own background is `magicPlum`, which
          is why the screen behind it must be that exact value. */}
      <Image
        source={bloomFull}
        style={styles.art}
        contentFit="cover"
        contentPosition="bottom center"
        accessibilityLabel="The woman from the welcome screen beneath a fully flowering branch"
      />

      <View style={styles.copy}>
        <Animated.View style={lead}>
          <Text style={[type.bodyLG, styles.lead]}>Based on what you’ve shared,</Text>
        </Animated.View>

        <View style={styles.afterLead} />
        <Animated.View style={headline}>
          <Text style={[type.displayXL, styles.headline]}>
            you’re likely in{'\n'}
            <Text style={accent(color.mustard)}>early perimenopause.</Text>
          </Text>
        </Animated.View>

        <View style={styles.afterHeadline} />
        <Animated.View style={closing}>
          <Text style={[type.bodyLG, styles.closing]}>
            Your symptoms are real. They have a name. And now they’re trackable.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Start tracking" size="hero" onPress={onContinue} />
      </View>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: artColor.magicPlum,
  },
  art: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    aspectRatio: screen.magicMoment.artAspectRatio,
  },
  copy: {
    paddingTop: layout.headerTopInset,
    paddingHorizontal: layout.gutter,
  },
  lead: {
    color: text.onDarkMuted,
  },
  afterLead: {
    height: space.sm,
  },
  headline: {
    color: text.onDark,
  },
  afterHeadline: {
    height: space.xl,
  },
  closing: {
    color: text.onDark,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: layout.gutter,
    paddingBottom: layout.screenBottom,
  },
});
