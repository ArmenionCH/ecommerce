import { supabaseClient } from '@/lib/supabase';
import type { UserRole } from '@/lib/types';

export type AuthResult = { success: true } | { success: false; error: string };

/**
 * Browser-side auth — persists session in localStorage via supabase-js.
 * Server actions cannot do this; they only authenticate an ephemeral server client.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
): Promise<AuthResult> {
  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabaseClient.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
}
