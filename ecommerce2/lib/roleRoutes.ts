import type { UserRole } from '@/lib/types';

/** Default landing route after sign-in / logo click per role. */
export function getHomePathForRole(role: UserRole | undefined | null): string {
  if (role === 'admin') return '/admin';
  if (role === 'seller') return '/seller';
  return '/';
}

export function canBrowseMarketplace(role: UserRole | undefined | null): boolean {
  return !role || role === 'customer';
}
