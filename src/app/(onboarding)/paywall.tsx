import { CalendarDays, Sparkles, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  GrainOverlay,
  OptionCard,
  PrimaryButton,
  TextLink,
  useStatusBarStyle,
} from '@/components/ui';
import { color, layout, space, text } from '@/constants/tokens';
import { type } from '@/constants/typography';

/**
 * Yearly is the anchor and is pushed hardest — $49.99 against $9.99 a month is a
 * 58% saving, and PRODUCT_BRIEF.md §3 prices it to sit level with Balance and
 * Caria. It is pre-selected, and §7 pins it to mustard with monthly in tan,
 * which is why these two carry an explicit fill rather than the cycled one.
 */
const plans: {
  id: 'yearly' | 'monthly';
  label: string;
  subLabel: string;
  terms: string;
  icon: LucideIcon;
  fill: string;
}[] = [
  {
    id: 'yearly',
    label: '$49.99 a year',
    subLabel: 'Works out at $4.17 a month — save 58%',
    terms: 'Three days free, then $49.99 a year. Cancel any time before it ends.',
    icon: Sparkles,
    fill: color.mustard,
  },
  {
    id: 'monthly',
    label: '$9.99 a month',
    subLabel: 'Billed every month',
    terms: 'Three days free, then $9.99 a month. Cancel any time before it ends.',
    icon: CalendarDays,
    fill: color.tan,
  },
];

/**
 * Onboarding screen 9 of 9 — the paywall shell.
 *
 * §7: returns to cream, no illustration, `displaySM` heading, yearly
 * pre-selected, trial terms in `caption`, restore and terms as `TextLink`.
 *
 * A shell by design (§9, milestone 3). Superwall renders the real thing from a
 * remote template so the paywall can be A/B tested without a redeploy, and
 * RevenueCat owns entitlements — both land in milestone 5. What matters here is
 * that the template has exact token values to match.
 */
export default function PaywallScreen() {
  const [selected, setSelected] = useState(0);

  useStatusBarStyle('dark');

  const onStartTrial = () => {
    // RevenueCat purchase flow — milestone 5.
  };

  const onRestore = () => {
    // RevenueCat restore — milestone 5.
  };

  const onTerms = () => {
    // Opens the hosted terms — milestone 5.
  };

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={type.displaySM}>Everything, free for three days.</Text>

        <View style={styles.afterHeading} />
        <Text style={type.bodyLG}>
          Daily tracking, one insight a day, and a report you can hand to your doctor.
        </Text>

        <View style={styles.afterLead} />
        <View style={styles.plans}>
          {plans.map((plan, index) => (
            <OptionCard
              key={plan.id}
              label={plan.label}
              subLabel={plan.subLabel}
              icon={plan.icon}
              index={index}
              fill={plan.fill}
              selected={selected === index}
              onPress={() => setSelected(index)}
            />
          ))}
        </View>

        <View style={styles.afterPlans} />
        <Text style={[type.caption, styles.terms]}>{plans[selected]?.terms}</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Start 3-day free trial" onPress={onStartTrial} />

        <View style={styles.afterCta} />
        <View style={styles.links}>
          <TextLink label="Restore purchase" onPress={onRestore} />
          <TextLink label="Terms and privacy" onPress={onTerms} />
        </View>
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
  content: {
    paddingTop: layout.headerTopInset,
    paddingHorizontal: layout.gutter,
  },
  afterHeading: {
    height: space.lg,
  },
  afterLead: {
    height: space['5xl'],
  },
  plans: {
    gap: space.lg,
  },
  afterPlans: {
    height: space.xl,
  },
  terms: {
    // `caption` defaults to the on-fill tone; on cream it takes the tertiary one.
    color: text.tertiary,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: layout.gutter,
    paddingBottom: layout.screenBottom,
  },
  afterCta: {
    height: space['2xl'],
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space['3xl'],
  },
});
