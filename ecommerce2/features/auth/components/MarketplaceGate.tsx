'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '../hooks/useUserSession';
import { getHomePathForRole, canBrowseMarketplace } from '@/lib/roleRoutes';

interface MarketplaceGateProps {
  children: React.ReactNode;
}

/**
 * Renders marketplace content only for guests and customers.
 * Admins and sellers are redirected to their dashboards.
 */
export function MarketplaceGate({ children }: MarketplaceGateProps) {
  const router = useRouter();
  const { user, isLoading } = useUserSession();

  useEffect(() => {
    if (isLoading || !user) return;
    if (!canBrowseMarketplace(user.role)) {
      router.replace(getHomePathForRole(user.role));
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (user && !canBrowseMarketplace(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return <>{children}</>;
}
