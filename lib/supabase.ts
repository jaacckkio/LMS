import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { auth } from './firebase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Execute a Supabase query with automatic 401 retry.
 * If the first attempt fails with a 401 (expired JWT), re-bridges the
 * Firebase session and retries once. Prevents silent failures when the
 * 1-hour Supabase token expires mid-session.
 */
export async function withAuthRetry<T>(
  queryFn: () => PromiseLike<{ data: T; error: PostgrestError | null }>,
): Promise<{ data: T; error: PostgrestError | null }> {
  const result = await queryFn();

  if (result.error && result.error.code === 'PGRST301') {
    // 401 — token expired. Re-bridge and retry once.
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        const { refreshSupabaseSession } = await import('./authBridge');
        await refreshSupabaseSession(firebaseUser);
        return queryFn();
      } catch {
        // Re-bridge failed — return original error
      }
    }
  }

  return result;
}
