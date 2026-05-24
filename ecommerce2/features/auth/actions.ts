'use server';

import { createServerClient } from '@/lib/supabaseServer';
import type { UserRole } from '@/lib/types';

/**
 * Sign in a user with email and password.
 */
export async function signIn(email: string, password: string) {
  const supabase = createServerClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error occurred' };
  }
}

/**
 * Sign up a new user with metadata (full name, role) for profile creation.
 */
export async function signUp(email: string, password: string, fullName: string, role: UserRole) {
  const supabase = createServerClient();
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error occurred' };
  }
}

/**
 * Sign out the currently active user session.
 */
export async function signOut() {
  const supabase = createServerClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error occurred' };
  }
}
