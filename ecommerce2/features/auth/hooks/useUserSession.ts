'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import { fetchProfileWithRetry } from '../profileLoader';

export interface UserSession {
  user: Profile | null;
  isLoading: boolean;
  hasAuthSession: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isCustomer: boolean;
}

export function useUserSession(): UserSession {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [hasAuthSession, setHasAuthSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applySession = async (session: Session | null) => {
      if (cancelled) return;

      if (!session?.user) {
        setHasAuthSession(false);
        setUser(null);
        setLoading(false);
        return;
      }

      setHasAuthSession(true);
      setLoading(true);
      const profile = await fetchProfileWithRetry(session.user.id, session);
      if (!cancelled) {
        setUser(profile);
        setLoading(false);
      }
    };

    void (async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      await applySession(session);
    })();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        await applySession(session);
      },
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    hasAuthSession,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isCustomer: user?.role === 'customer',
  };
}
