import { supabase } from './client';
import { requireUserId } from './session';
import { today } from './logs';
import type { Enums } from './database.types';

export type MedicationType = Enums<'medication_type'>;

export interface Medication {
  id: string;
  name: string;
  type: MedicationType;
  dose: string | null;
  frequency: string | null;
  /** Free text from her, rendered as given: "Left thigh today". */
  rotationNotes: string | null;
  reminderHour: number | null;
  createdAt: string;
  /** Whether a dose is recorded for today. */
  takenToday: boolean;
}

export interface NewMedication {
  name: string;
  type: MedicationType;
  dose?: string;
  rotationNotes?: string;
  reminderHour?: number | null;
}

/**
 * Her active medications, each with whether today's dose is recorded.
 *
 * Two queries rather than a join, because the dose rows are scoped to one date
 * and a left join would need the filter in the ON clause — easy to get subtly
 * wrong, and this is two round trips on a list that is almost always one or two
 * items long.
 */
export async function fetchMedications(): Promise<Medication[]> {
  await requireUserId();

  const [{ data: meds, error }, { data: doses, error: doseError }] = await Promise.all([
    supabase
      .from('medications')
      .select('id, name, type, dose, frequency, rotation_notes, reminder_hour, created_at')
      .eq('active', true)
      .order('created_at'),
    supabase.from('medication_doses').select('medication_id').eq('taken_on', today()),
  ]);

  if (error) throw new Error(`Could not load medications: ${error.message}`);
  if (doseError) throw new Error(`Could not load today's doses: ${doseError.message}`);

  const takenIds = new Set((doses ?? []).map((d) => d.medication_id));

  return (meds ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    dose: m.dose,
    frequency: m.frequency,
    rotationNotes: m.rotation_notes,
    reminderHour: m.reminder_hour,
    createdAt: m.created_at,
    takenToday: takenIds.has(m.id),
  }));
}

export async function createMedication(med: NewMedication): Promise<void> {
  const userId = await requireUserId();

  const { error } = await supabase.from('medications').insert({
    user_id: userId,
    name: med.name,
    type: med.type,
    dose: med.dose?.trim() || null,
    rotation_notes: med.rotationNotes?.trim() || null,
    reminder_hour: med.reminderHour ?? null,
  });

  if (error) throw new Error(`Could not save the medication: ${error.message}`);
}

/**
 * Records or un-records today's dose.
 *
 * Undoable for the rest of the day, which is why taking it back deletes the row
 * rather than writing a "not taken" one. Nothing here is an adherence score:
 * a day with no row is a day with no row, never a miss.
 */
export async function setTakenToday(medicationId: string, taken: boolean): Promise<void> {
  const userId = await requireUserId();

  if (taken) {
    const { error } = await supabase
      .from('medication_doses')
      .upsert(
        { user_id: userId, medication_id: medicationId, taken_on: today() },
        { onConflict: 'user_id,medication_id,taken_on' },
      );
    if (error) throw new Error(`Could not record the dose: ${error.message}`);
    return;
  }

  const { error } = await supabase
    .from('medication_doses')
    .delete()
    .eq('medication_id', medicationId)
    .eq('taken_on', today());
  if (error) throw new Error(`Could not undo the dose: ${error.message}`);
}

export interface MedicationStats {
  /** Distinct days with any dose recorded. */
  daysTracked: number;
  /** When she started — the earliest medication, not the earliest dose. */
  startedAt: string | null;
}

export async function fetchMedicationStats(): Promise<MedicationStats> {
  await requireUserId();

  const [{ data: doses }, { data: meds }] = await Promise.all([
    supabase.from('medication_doses').select('taken_on'),
    supabase.from('medications').select('created_at').order('created_at').limit(1),
  ]);

  return {
    daysTracked: new Set((doses ?? []).map((d) => d.taken_on)).size,
    startedAt: meds?.[0]?.created_at ?? null,
  };
}
