import type { Session } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';

const VALID_ROLES: UserRole[] = ['customer', 'seller', 'admin'];

function parseRole(value: unknown): UserRole {
  if (typeof value === 'string' && VALID_ROLES.includes(value as UserRole)) {
    return value as UserRole;
  }
  return 'customer';
}

export function profileFromSession(session: Session): Profile {
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    full_name: (meta.full_name as string) || session.user.email?.split('@')[0] || 'User',
    role: parseRole(meta.role),
    phone_number: null,
    delivery_address: null,
    metadata: {},
    created_at: session.user.created_at ?? new Date().toISOString(),
  };
}

// Global flag to prevent concurrent profile fetches
let isFetchingProfile = false;

/** Fetch profile with a hard timeout — never hangs the UI. */
export async function fetchProfileWithRetry(
  userId: string,
  session?: Session | null,
  maxAttempts = 2,           // reduced from 3 to prevent retry loops
): Promise<Profile | null> {
  // Prevent concurrent fetches
  if (isFetchingProfile) {
    console.warn('[MarketHub] Profile fetch already in progress, skipping');
    return session ? profileFromSession(session) : null;
  }

  isFetchingProfile = true;

  try {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const timeout = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 3000)  // reduced from 4000ms
        );

        const query = supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const result = await Promise.race([query, timeout]);

        // timeout fired
        if (result === null) {
          console.warn(`[MarketHub] Profile attempt ${attempt + 1} timed out`);
          continue;
        }

        const { data: profile, error } = result;

        if (profile) return profile as Profile;

        if (error && error.code !== 'PGRST116') {
          console.error('[MarketHub] Profile fetch error:', error.message);
          break;
        }
      } catch (e) {
        console.warn(`[MarketHub] Profile attempt ${attempt + 1} failed`, e);
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));  // increased from 300ms
      }
    }

    // Always fall back to session metadata — never leave user stuck
    return session ? profileFromSession(session) : null;
  } finally {
    isFetchingProfile = false;
  }
}