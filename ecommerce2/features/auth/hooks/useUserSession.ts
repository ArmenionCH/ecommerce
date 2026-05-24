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
    // Subscribe to auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Fetch profile from DB — role from DB, not JWT
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(profile ?? null);
        setLoading(false);
      }
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
