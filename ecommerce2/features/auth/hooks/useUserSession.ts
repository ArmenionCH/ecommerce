'use client';

/**
 * USER SESSION HOOK
 *
 * Watches Supabase auth state changes. On login, fetches the user's
 * full profile (including role) from public.profiles. Provides a
 * unified session object to all components.
 *
 * SECURITY NOTE: The role comes from the database, NOT from the JWT.
 * This prevents role-spoofing via token manipulation.
 */

import { useEffect, useState }  from 'react';
import { supabaseClient }       from '@/lib/supabase';
import type { Profile }         from '@/lib/types';

export interface UserSession {
  user      : Profile | null;
  isLoading : boolean;
  isAdmin   : boolean;
  isSeller  : boolean;
  isCustomer: boolean;
}

export function useUserSession(): UserSession {
  const [user, setUser]         = useState<Profile | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadProfileForSession = async (userId: string) => {
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[GreenMarket] Failed to load profile:', error.message);
      }
      setUser(profile ?? null);
      setLoading(false);
    };

    const hydrateFromSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }
      await loadProfileForSession(session.user.id);
    };

    void hydrateFromSession();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }
        await loadProfileForSession(session.user.id);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAdmin   : user?.role === 'admin',
    isSeller  : user?.role === 'seller',
    isCustomer: user?.role === 'customer',
  };
}
