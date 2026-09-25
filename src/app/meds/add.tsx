import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button, CrestHeader, GrainOverlay } from '@/components/ui';
import { opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import { applyReminders } from '@/lib/notifications/reminders';
import { createMedication, type MedicationType } from '@/lib/supabase/medications';
import { useTheme } from '@/lib/theme';

const TYPES: { value: MedicationType; label: string }[] = [
  { value: 'gel', label: 'Gel' },
  { value: 'patch', label: 'Patch' },
  { value: 'pill', label: 'Pill' },
  { value: 'spray', label: 'Spray' },
  { value: 'other', label: 'Other' },
];

/** Accepts "22:00", "22.00" or "2200" and returns the hour, or null. */
function parseHour(input: string): number | null {
  const digits = input.replace(/[^0-9]/g, '');
  if (digits.length < 1) return null;
  const hour = Number(digits.slice(0, 2));
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
}

/**
 * Add a medication, from `design/screens/MedAdd.dc.html`.
 *
 * Five fields and no more. The artboard collects no frequency even though the
 * column exists, so neither does this — an optional field she has to think
 * about is a field that costs her something.
 */
export default function MedAddScreen() {
  const { c } = useTheme();

  /**
   * Back where there is a history, the list where there is not. A cold deep
   * link has nothing to pop, and leaving her on a form she has already
   * submitted is the worst of the options.
   */
  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/meds');
    }
  };

  const [name, setName] = useState('');
  const [type, setType] = useState<MedicationType>('gel');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('');
  const [rotation, setRotation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hour = parseHour(time);
  const timeInvalid = time.trim().length > 0 && hour === null;
  const canSave = name.trim().length > 0 && !timeInvalid;

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await createMedication({
        name: name.trim(),
        type,
        dose,
        rotationNotes: rotation,
        reminderHour: hour,
      });
      // Its reminder hour starts firing now, not the next time she opens the app.
      void applyReminders({ requestPermission: true }).catch(() => undefined);
      leave();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={150} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={leave}
              hitSlop={6}
              style={({ pressed }) => [
                styles.close,
                pressed ? { opacity: opacity.pressed } : null,
              ]}
            >
              <X size={18} strokeWidth={2} color={c.textOnNight} />
            </Pressable>
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
              Add medication
            </Text>
          </View>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Field label="Name">
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Estradiol gel"
            autoFocus
          />
        </Field>

        <Field label="Type">
          <View style={styles.types}>
            {TYPES.map((t) => (
              <Pressable
                key={t.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: type === t.value }}
                accessibilityLabel={t.label}
                onPress={() => setType(t.value)}
                style={[
                  styles.type,
                  type === t.value
                    ? { backgroundColor: c.textPrimary, borderColor: 'transparent' }
                    : { backgroundColor: c.surface, borderColor: c.lineStrong },
                ]}
              >
                <Text
                  style={[
                    typeStyles.label,
                    { color: type === t.value ? c.canvas : c.textPrimary },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Dose" hint="How it appears on the reminder.">
          <Input value={dose} onChangeText={setDose} placeholder="2 pumps" />
        </Field>

        <Field
          label="Reminder time"
          hint={
            timeInvalid
              ? 'Use a time between 00:00 and 23:59.'
              : 'Fires on its own schedule, separate from the daily log.'
          }
          hintTone={timeInvalid ? 'error' : 'muted'}
        >
          <Input
            value={time}
            onChangeText={setTime}
            placeholder="22:00"
            keyboardType="numbers-and-punctuation"
          />
        </Field>

        <Field label="Rotation notes" hint="Free text. Shown under the dose each day.">
          <Input value={rotation} onChangeText={setRotation} placeholder="Left thigh today" />
        </Field>

        {error ? (
          <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text>
        ) : null}

        <View style={styles.save}>
          <Button
            label="Save medication"
            disabled={!canSave}
            loading={saving}
            onPress={() => void onSave()}
          />
        </View>
      </ScrollView>

      <GrainOverlay />
    </View>
  );
}

function Field({
  label,
  hint,
  hintTone = 'muted',
  children,
}: {
  label: string;
  hint?: string;
  hintTone?: 'muted' | 'error';
  children: React.ReactNode;
}) {
  const { c } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[typeStyles.label, styles.fieldLabel, { color: c.textSecondary }]}>
        {label}
      </Text>
      {children}
      {hint ? (
        <Text
          style={[
            typeStyles.caption,
            styles.hint,
            { color: hintTone === 'error' ? c.clay : c.textTertiary },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const { c } = useTheme();
  return (
    <TextInput
      placeholderTextColor={c.textTertiary}
      {...props}
      style={[
        typeStyles.body,
        styles.input,
        { backgroundColor: c.surface, borderColor: c.line, color: c.textPrimary },
      ]}
    />
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
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(253,248,241,0.16)',
  },
  title: {
    flex: 1,
  },
  body: {
    paddingTop: 22,
    paddingHorizontal: space.space6,
    paddingBottom: space.space12,
  },
  field: {
    marginBottom: space.space5,
  },
  fieldLabel: {
    marginBottom: space.space2,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: space.space4,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  hint: {
    marginTop: space.space2,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.space2,
  },
  type: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  save: {
    marginTop: space.space2,
  },
});
