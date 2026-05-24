'use client';

import React from 'react';
import { useUserSession } from '../hooks/useUserSession';
import type { UserRole } from '@/lib/types';
import { LinkButton } from '@/components/ui/link-button';
import { getHomePathForRole } from '@/lib/roleRoutes';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { user, isLoading, hasAuthSession } = useUserSession();

  if (isLoading || (hasAuthSession && !user)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const hasAccess = user && allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    const home = user ? getHomePathForRole(user.role) : '/';

    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto my-12">
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-2xl">🔒</div>
        <h3 className="text-lg font-bold text-gray-900">Wrong account type</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6 max-w-xs">
          {user
            ? `You're signed in as a ${user.role}. This page needs a ${allowedRoles.join(' or ')} account.`
            : 'Please sign in with the right account to continue.'}
        </p>
        <LinkButton href={home} variant="outline">
          {user ? 'Go to my dashboard' : 'Browse marketplace'}
        </LinkButton>
      </div>
    );
  }

  return <>{children}</>;
}
