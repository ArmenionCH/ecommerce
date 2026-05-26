'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import { fetchProfileWithRetry } from '../profileLoader';
import { usePageVisibility } from '@/components/layout/PageVisibilityProvider';

export interface UserSession {
  user: Profile | null;
  isLoading: boolean;
  hasAuthSession: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isCustomer: boolean;
  isBanned: boolean;
}

const UserSessionContext = createContext<UserSession | null>(null);

export function useUserSession(): UserSession {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error('useUserSession must be used within UserSessionProvider');
  }
  return context;
}

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [hasAuthSession, setHasAuthSession] = useState(false);
  const isVisible = usePageVisibility();

  useEffect(() => {
    let cancelled = false;
    let debounceTimer: NodeJS.Timeout | null = null;

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
      // Don't fetch profile if tab is hidden
      if (isVisible) {
        const profile = await fetchProfileWithRetry(session.user.id, session);
        if (!cancelled) {
          setUser(profile);
        }
      }
      setLoading(false);
    };

    void (async () => {
      // Don't fetch initial session if tab is hidden
      if (!isVisible) return;
      const { data: { session } } = await supabaseClient.auth.getSession();
      await applySession(session);
    })();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        // Don't fetch profile if tab is hidden
        if (!isVisible) return;

        // Debounce to prevent multiple rapid calls on tab focus
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          await applySession(session);
        }, 300); // 300ms debounce
      },
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [isVisible]);

  const value: UserSession = {
    user,
    isLoading,
    hasAuthSession,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isCustomer: user?.role === 'customer',
    isBanned: user?.is_banned || false,
  };

  return (
    <UserSessionContext.Provider value={value}>
      {children}
    </UserSessionContext.Provider>
  );
}
