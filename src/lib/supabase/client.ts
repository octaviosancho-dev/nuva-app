import { createClient, type SupportedStorage } from '@supabase/supabase-js';

import { openStore } from '@/lib/storage/backend';
import type { Database } from './database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  // Failing loudly at startup beats every query failing later with a vague
  // network error. These are inlined at build time, so a miss here means the
  // .env was not present when the bundle was built.
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. See .env.',
  );
}

/**
 * The session lives in the same store the onboarding answers do — MMKV on a
 * development build, a JSON file in Expo Go. Supabase expects the async
 * signature, and our store is synchronous, so the promises resolve immediately.
 */
const sessionStore = openStore('nuva.auth');

const storage: SupportedStorage = {
  getItem: (k) => Promise.resolve(sessionStore.store.getString(k) ?? null),
  setItem: (k, v) => Promise.resolve(sessionStore.store.set(k, v)),
  removeItem: (k) => Promise.resolve(sessionStore.store.remove(k)),
};

/**
 * The typed Supabase client. `Database` is generated from the live schema, so
 * a column rename surfaces as a type error rather than as a silent undefined.
 *
 * Every read and write here is subject to row level security: the policies
 * compare `auth.uid()` to the row's `user_id`, so without a session the
 * database returns nothing and accepts nothing. See `supabase/README.md`.
 */
export const supabase = createClient<Database>(url, key, {
  auth: {
    storage,
    // The session is restored from storage and refreshed in the background.
    persistSession: true,
    autoRefreshToken: true,
    // A native app never lands on a URL carrying an auth fragment, and leaving
    // this on makes the client look for one that will never be there.
    detectSessionInUrl: false,
  },
});
