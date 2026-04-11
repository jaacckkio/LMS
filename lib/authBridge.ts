/**
 * Firebase ↔ Supabase JWT bridge.
 *
 * After Firebase sign-in, calls the Edge Function to mint a Supabase JWT
 * and sets the Supabase session. Checks for an existing valid session first
 * to avoid unnecessary bridge calls.
 */

import { User } from 'firebase/auth';
import { supabase } from './supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

/**
 * Bridge a Firebase user into a Supabase session.
 * Skips the call if a valid Supabase session already exists.
 */
export async function bridgeFirebaseToSupabase(firebaseUser: User): Promise<void> {
  // Check for existing valid session — skip bridge if still good
  const { data: { session } } = await supabase.auth.getSession();
  if (session && session.expires_at && session.expires_at > Date.now() / 1000 + 60) {
    // Session still valid with >1 minute left
    return;
  }

  const idToken = await firebaseUser.getIdToken();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/firebase-auth-bridge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown' }));
    throw new Error(`Bridge failed (${res.status}): ${body.error}`);
  }

  const { access_token, refresh_token } = await res.json();

  await supabase.auth.setSession({ access_token, refresh_token });
}

/**
 * Re-authenticate the Supabase session by calling the bridge again.
 * Used by the 401 retry interceptor when the token expires mid-session.
 */
export async function refreshSupabaseSession(firebaseUser: User): Promise<void> {
  const idToken = await firebaseUser.getIdToken(true); // force-refresh Firebase token
  const res = await fetch(`${SUPABASE_URL}/functions/v1/firebase-auth-bridge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    throw new Error(`Bridge refresh failed (${res.status})`);
  }

  const { access_token, refresh_token } = await res.json();
  await supabase.auth.setSession({ access_token, refresh_token });
}
