import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthState } from '../lib/firebase';
import { bridgeFirebaseToSupabase } from '../lib/authBridge';
import { supabase } from '../lib/supabase';
import { FEATURES } from '../constants/features';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (u) => {
      setUser(u);

      if (u && FEATURES.useSupabaseBridge) {
        try {
          await bridgeFirebaseToSupabase(u);
        } catch (e) {
          console.warn('[auth-bridge] failed, continuing with mocks', e);
        }
      } else if (!u && FEATURES.useSupabaseBridge) {
        // Signed out — clear Supabase session too
        await supabase.auth.signOut().catch(() => {});
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
