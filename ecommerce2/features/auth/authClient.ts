import { supabaseClient } from '@/lib/supabase';
import type { UserRole } from '@/lib/types';
import { fetchProfileWithRetry } from './profileLoader';
import { getHomePathForRole } from '@/lib/roleRoutes';

export type AuthResult =
  | { success: true; needsEmailConfirmation: true }
  | { success: true; needsEmailConfirmation: false; role: UserRole; redirectTo: string }
  | { success: false; error: string };

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  if (!data.session) {
    return { success: false, error: 'Sign-in succeeded but no session was created. Try again.' };
  }

  const profile = await fetchProfileWithRetry(data.session.user.id, data.session);
  const role = profile?.role ?? 'customer';
  return {
    success: true,
    needsEmailConfirmation: false,
    role,
    redirectTo: getHomePathForRole(role),
  };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
): Promise<AuthResult> {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });
  if (error) return { success: false, error: error.message };

  if (!data.session) {
    return { success: true, needsEmailConfirmation: true };
  }

  const profile = await fetchProfileWithRetry(data.session.user.id, data.session);
  const resolvedRole = profile?.role ?? role;
  return {
    success: true,
    needsEmailConfirmation: false,
    role: resolvedRole,
    redirectTo: getHomePathForRole(resolvedRole),
  };
}

export async function signOut(): Promise<{ success: true } | { success: false; error: string }> {
  const { error } = await supabaseClient.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
}
