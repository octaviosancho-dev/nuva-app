import { reset as resetOnboarding } from '@/lib/storage/onboarding';

import { supabase } from './client';
import { requireUserId } from './session';

export interface AccountSummary {
  /** Null for the anonymous account every install starts with. */
  email: string | null;
  /** "Apple", "Google" — the provider she signed in with, when she has. */
  provider: string | null;
  anonymous: boolean;
}

const PROVIDER_NAMES: Record<string, string> = { apple: 'Apple', google: 'Google', email: 'email' };

export async function fetchAccount(): Promise<AccountSummary> {
  await requireUserId();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const raw = user?.app_metadata.provider;
  return {
    // Anonymous users come back with `email: ""`, not null — `||`, not `??`.
    email: user?.email || null,
    provider: typeof raw === 'string' ? (PROVIDER_NAMES[raw] ?? raw) : null,
    anonymous: user?.is_anonymous ?? true,
  };
}

/**
 * Deletes her account and everything in it, permanently.
 *
 * The server side is one function, `delete_my_account()`, which deletes her
 * `auth.users` row; every table that holds her data cascades from it. Then the
 * local copies go: the session on this device and the onboarding answers. The
 * next query starts a fresh anonymous account, as a new install would.
 *
 * There is no soft delete and no grace period. "Permanent, including every
 * log" is what the Settings screen promises, and it has to be true.
 */
export async function deleteMyAccount(): Promise<void> {
  await requireUserId();
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error(`Could not delete your account: ${error.message}`);

  // The server-side session died with the user, so only the local copy is left.
  await supabase.auth.signOut({ scope: 'local' });
  resetOnboarding();
}
