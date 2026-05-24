/**
 * Auth runs in the browser via `authClient.ts` so Supabase can persist the session.
 * Import signIn / signUp / signOut from `@/features/auth/authClient` in client components.
 */
export { signIn, signUp, signOut } from './authClient';
export type { AuthResult } from './authClient';
