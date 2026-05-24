'use client';

import React from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { useSellerMetrics } from '@/features/analytics/hooks/useSellerMetrics';
import { FulfillmentStats } from '@/features/analytics/components/FulfillmentStats';
import { EarningsChart } from '@/features/analytics/components/EarningsChart';
import { Button } from '@/components/ui/button';
import { Leaf, PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const { user, isLoading: isSessionLoading } = useUserSession();
  const sellerId = user && user.role === 'seller' ? user.id : null;
  const { metrics, earningsHistory, isLoading: isMetricsLoading } = useSellerMetrics(sellerId);

  if (isSessionLoading || isMetricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'seller') {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto my-10 space-y-4">
        <span className="text-5xl">🔒</span>
        <h3 className="text-xl font-bold text-gray-800">Seller Center Guarded</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Please sign in as a verified farmer/seller to access the Seller Dashboard.
        </p>
        <Link href="/" passHref legacyBehavior>
          <Button variant="outline" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Seller Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Track your farm earnings and fulfill active customer shipments.</p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/seller/inventory" passHref legacyBehavior>
            <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-500">
              <PlusCircle className="w-4.5 h-4.5" />
              Manage Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* Fulfillment Metrics */}
      <FulfillmentStats metrics={metrics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <EarningsChart data={earningsHistory} />
        
        {/* Farm Verification Info Card */}
        <div className="col-span-1 border border-gray-100 bg-white rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">Farm Status</h4>
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <Leaf className="w-4.5 h-4.5 flex-shrink-0" />
              <span>Verified Local Vendor</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your vendor account is active and verified. Any new product listings you post will immediately reflect on the marketplace.
            </p>
          </div>
          <div className="pt-4 border-t border-gray-50">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Shop Name</span>
            <span className="text-sm font-extrabold text-gray-700 mt-0.5 block">
              {((user.metadata as { shop_name?: string } | undefined)?.shop_name) || 'My Local Farms'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
