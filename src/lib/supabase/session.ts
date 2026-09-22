import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './client';

/**
 * Supabase refreshes the access token on a timer, and that timer does not run
 * while the app is backgrounded. Tying it to foreground/background means a
 * session that was valid yesterday is valid again the moment she opens the app,
 * rather than failing one query and then recovering.
 */
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    void supabase.auth.startAutoRefresh();
  } else {
    void supabase.auth.stopAutoRefresh();
  }
});

/**
 * Makes sure there is a session, creating an anonymous one if there is none.
 *
 * Every table's RLS policy compares `auth.uid()` to the row's `user_id`. With
 * no session `auth.uid()` is NULL, and NULL equals nothing in SQL — so reads
 * return zero rows and writes are refused. An identity is not a login screen
 * here; it is the only way a row can have an owner.
 *
 * Anonymous is the right default for this product, not just a development
 * shortcut. She answers six questions and sees the magic moment before anything
 * asks her to sign up — the artboards put `Auth` after the paywall — so her
 * answers need somewhere to live before she has an account. When she does sign
 * in with Apple or Google, that identity links to this same user and
 * everything already saved comes with it.
 */
export async function ensureSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    return data.session;
  }

  const { data: created, error } = await supabase.auth.signInAnonymously();
  if (error) {
    // Offline, or anonymous sign-ins are switched off for the project. The app
    // keeps working on local storage; the sync is what waits.
    console.warn('[nuva] anonymous sign-in failed:', error.message);
    return null;
  }
  return created.session;
}

export interface SessionState {
  session: Session | null;
  /** False until the first `getSession` has resolved. */
  ready: boolean;
}

/**
 * The current session, kept in sync with Supabase's own auth events so a later
 * link to Apple or Google updates every consumer at once.
 */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void ensureSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setReady(true);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!cancelled) setSession(next);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, ready };
}
