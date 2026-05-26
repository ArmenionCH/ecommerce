'use client';

import React from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { useSellerMetrics } from '@/features/analytics/hooks/useSellerMetrics';
import { useSellerProductReport } from '@/features/analytics/hooks/useSellerProductReport';
import { FulfillmentStats } from '@/features/analytics/components/FulfillmentStats';
import { EarningsChart } from '@/features/analytics/components/EarningsChart';
import { ProductSalesReport } from '@/features/analytics/components/ProductSalesReport';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { getHomePathForRole } from '@/lib/roleRoutes';
import { PlusCircle } from 'lucide-react';

export default function SellerDashboardPage() {
  const { user, isLoading: isSessionLoading, hasAuthSession } = useUserSession();
  const sellerId = user && user.role === 'seller' ? user.id : null;
  const { metrics, earningsHistory, isLoading: isMetricsLoading } = useSellerMetrics(sellerId);
  const { rows: productReport, isLoading: isReportLoading, error: reportError } =
    useSellerProductReport(sellerId);

  if (isSessionLoading || (hasAuthSession && !user) || isMetricsLoading || isReportLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!user || user.role !== 'seller') {
    const home = user ? getHomePathForRole(user.role) : '/';
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto my-10 space-y-4 px-6">
        <span className="text-4xl">🔒</span>
        <h3 className="text-lg font-bold text-gray-900">Seller area only</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          {user
            ? `You're signed in as a ${user.role}. Create a seller account or use a seller login.`
            : 'Sign in with a seller account to manage inventory and view sales.'}
        </p>
        <LinkButton href={home} variant="outline">
          {user ? 'Go to my dashboard' : 'Back to marketplace'}
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Seller Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Track sales, earnings, and how each product is performing.</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/seller/settings" variant="outline" className="gap-1.5">
            Settings
          </LinkButton>
          <LinkButton href="/seller/inventory" className="gap-1.5 bg-emerald-600 hover:bg-emerald-500">
            <PlusCircle className="w-4 h-4" />
            Manage inventory
          </LinkButton>
        </div>
      </div>

      <FulfillmentStats metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <EarningsChart data={earningsHistory} />
      </div>

      <ProductSalesReport rows={productReport} isLoading={false} error={reportError} />
    </div>
  );
}
