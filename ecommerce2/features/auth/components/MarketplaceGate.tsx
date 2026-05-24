'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '../hooks/useUserSession';
import { getHomePathForRole, canBrowseMarketplace } from '@/lib/roleRoutes';

interface MarketplaceGateProps {
  children: React.ReactNode;
}

export function MarketplaceGate({ children }: MarketplaceGateProps) {
  const router = useRouter();
  const { user, isLoading, hasAuthSession } = useUserSession();

  useEffect(() => {
    if (isLoading) return;
    if (user && !canBrowseMarketplace(user.role)) {
      router.replace(getHomePathForRole(user.role));
    }
  }, [isLoading, user, router]);

  if (isLoading || (hasAuthSession && !user)) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (user && !canBrowseMarketplace(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
