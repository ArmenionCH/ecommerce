'use client';

import React from 'react';
import { useUserSession } from '../hooks/useUserSession';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getHomePathForRole } from '@/lib/roleRoutes';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { user, isLoading } = useUserSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const hasAccess = user && allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-xs max-w-md mx-auto my-12">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-6v2m0-5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Access Denied</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          You do not have the required permissions to view this page.
        </p>
        <Link href={getHomePathForRole(user?.role)} passHref legacyBehavior>
          <Button variant="outline">Go to dashboard</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
