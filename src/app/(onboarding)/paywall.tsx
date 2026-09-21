import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  Button,
  CrestHeader,
  EyebrowPill,
  GrainOverlay,
  TextLink,
  useEntrance,
  usePressScale,
} from '@/components/ui';
import { radius, space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';

/** What the subscription actually buys, in the order the artboard lists it. */
const INCLUDED = [
  'A 60-second log, and what each symptom means',
  'One insight a day, weighted to what you log',
  'The words to say at your appointment',
  'HRT tracking, if and when you start',
];

/**
 * Yearly first and pushed hardest — PRODUCT_BRIEF.md section 3 makes it the
 * anchor at a 58% saving. The monthly price is shown plainly beside it rather
 * than hidden, because a paywall that hides the cheap option reads as a trick
 * to exactly the person this product is for.
 */
const PLANS = [
  {
    id: 'yearly' as const,
    label: 'Yearly',
    badge: 'Save 58%',
    detail: '$49.99 a year, about $4.17 a month',
    note: 'Then $49.99 a year. Cancel any time in Settings.',
  },
  {
    id: 'monthly' as const,
    label: 'Monthly',
    badge: null,
    detail: '$9.99 a month',
    note: 'Then $9.99 a month. Cancel any time in Settings.',
  },
];

/**
 * The paywall, from `design/screens/Paywall.dc.html`. A hard paywall
 * immediately after the magic moment, before the app.
 *
 * The header is a `hero` crest on `night-deep`, carrying the trial offer
 * straight out of the magic moment's ground so the two screens read as one
 * thought rather than as a promise followed by a bill.
 *
 * This is the shell. RevenueCat entitlements and the Superwall variant land in
 * milestone 5; the CTA currently has nowhere to go until auth exists.
 */
export default function PaywallScreen() {
  const { c } = useTheme();
  const [plan, setPlan] = useState(0);

  const eyebrow = useEntrance(0);
  const headline = useEntrance(2);
  const cta = useEntrance(7);

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="hero" height={268} fill="nightDeep" bare>
        <View style={styles.headerInner}>
          <View style={styles.spacer} />

          <Animated.View style={eyebrow}>
            <EyebrowPill label="3 days free" variant="ember" />
          </Animated.View>

          <Animated.View style={headline}>
            <Text style={[typeStyles.displayXL, styles.headline, { color: c.textOnNight }]}>
              Stop guessing{'\n'}what this is.
            </Text>
          </Animated.View>
        </View>
      </CrestHeader>

      <View style={styles.body}>
        <View style={styles.included}>
          {INCLUDED.map((line, index) => (
            <IncludedRow key={line} label={line} index={index} />
          ))}
        </View>

        <View style={styles.plans}>
          {PLANS.map((option, index) => (
            <PlanRow
              key={option.id}
              plan={option}
              index={index}
              selected={plan === index}
              onPress={() => setPlan(index)}
            />
          ))}
        </View>

        <View style={styles.flex} />

        <Animated.View style={cta}>
          <Button label="Start 3-day trial" onPress={() => undefined} />
        </Animated.View>

        <Text style={[typeStyles.caption, styles.note, { color: c.textTertiary }]}>
          {PLANS[plan].note}
        </Text>

        <View style={styles.legal}>
          <TextLink label="Terms" size="caption" color={c.textPrimary} />
          <TextLink label="Privacy" size="caption" color={c.textPrimary} />
          <TextLink label="Restore" size="caption" color={c.textPrimary} />
        </View>
      </View>

      <GrainOverlay />
    </View>
  );
}

function IncludedRow({ label, index }: { label: string; index: number }) {
  const { c } = useTheme();
  const entrance = useEntrance(index + 1);

  return (
    <Animated.View style={[styles.includedRow, entrance]}>
      <View style={[styles.tick, { backgroundColor: c.lunaSoft }]}>
        <Check size={14} strokeWidth={2.4} color={c.lunaDeep} />
      </View>
      <Text style={[typeStyles.body, styles.includedLabel, { color: c.textPrimary }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

interface PlanRowProps {
  plan: (typeof PLANS)[number];
  index: number;
  selected: boolean;
  onPress: () => void;
}

/**
 * A taller `OptionCard` without the leading disc — the price is the subject, so
 * an icon beside it would only compete. Selection still reads the same way:
 * border, shadow, and a check in a slot that is always reserved.
 */
function PlanRow({ plan, index, selected, onPress }: PlanRowProps) {
  const { c, shadow } = useTheme();
  const entrance = useEntrance(index + 5);
  const press = usePressScale(0.99);

  return (
    <Animated.View style={[entrance, press.style]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={`${plan.label}. ${plan.detail}`}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          styles.plan,
          { backgroundColor: c.surface },
          selected
            ? [{ borderColor: c.textPrimary }, shadow.md]
            : [{ borderColor: 'transparent' }, shadow.xs],
        ]}
      >
        <View style={styles.flex}>
          <View style={styles.planTitle}>
            <Text style={[typeStyles.labelLG, { color: c.textPrimary }]}>{plan.label}</Text>
            {plan.badge ? <EyebrowPill label={plan.badge} variant="ember" /> : null}
          </View>
          <Text style={[typeStyles.bodySM, styles.planDetail, { color: c.textSecondary }]}>
            {plan.detail}
          </Text>
        </View>

        <View style={[styles.check, selected ? { backgroundColor: c.textPrimary } : null]}>
          {selected ? <Check size={15} strokeWidth={2.6} color={c.surface} /> : null}
        </View>
      </Pressable>
    </Animated.View>
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
    paddingBottom: space.space2,
  },
  spacer: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  headline: {
    marginTop: space.space3,
  },
  body: {
    flex: 1,
    paddingTop: 22,
    paddingHorizontal: space.space6,
    paddingBottom: space.space5,
  },
  included: {
    gap: 11,
    marginBottom: space.space5,
  },
  includedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.space3,
  },
  tick: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  includedLabel: {
    flex: 1,
  },
  plans: {
    gap: space.space3,
  },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space4,
    minHeight: 84,
    paddingVertical: space.space4,
    paddingHorizontal: space.space5,
    borderWidth: 2,
    borderRadius: radius.lg,
  },
  planTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space2,
  },
  planDetail: {
    marginTop: 2,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    marginTop: space.space3,
    textAlign: 'center',
  },
  legal: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 6,
  },
});
