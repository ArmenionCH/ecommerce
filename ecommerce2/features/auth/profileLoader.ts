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

/** Build a temporary profile from auth metadata when the DB row is not ready yet. */
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

/** Fetch profile with retries — new signups often need a moment for the DB trigger. */
export async function fetchProfileWithRetry(
  userId: string,
  session?: Session | null,
  maxAttempts = 6,
): Promise<Profile | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profile) return profile as Profile;
    if (error && error.code !== 'PGRST116') {
      console.error('[MarketHub] Profile fetch error:', error.message);
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  return session ? profileFromSession(session) : null;
}
