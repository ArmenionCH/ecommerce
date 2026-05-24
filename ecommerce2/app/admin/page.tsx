'use client';

import React, { useEffect, useState } from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { supabaseClient } from '@/lib/supabase';
import { SystemOverviewCard } from '@/features/admin-control/components/SystemOverviewCard';
import { ModerationRow } from '@/features/admin-control/components/ModerationRow';
import { deactivateProduct } from '@/features/admin-control/actions';
import { Button } from '@/components/ui/button';
import { Users, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { user, isLoading: isSessionLoading } = useUserSession();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlatformData = async () => {
    try {
      // 1. Fetch Gross Platform Sales
      const { data: orders, error: oErr } = await supabaseClient
        .from('orders')
        .select('total_amount')
        .neq('status', 'cancelled');
      
      if (oErr) throw oErr;
      const sales = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

      // 2. Fetch User & Product counts
      const { count: sellerCount, error: sErr } = await supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');
      
      if (sErr) throw sErr;

      const { count: customerCount, error: cErr } = await supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');
      
      if (cErr) throw cErr;

      const { count: productCount, error: pErr } = await supabaseClient
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (pErr) throw pErr;

      setStats({
        totalSales: sales,
        totalSellers: sellerCount || 0,
        totalProducts: productCount || 0,
        totalCustomers: customerCount || 0,
      });

      // 3. Fetch active listings for moderation
      const { data: prodList, error: plErr } = await supabaseClient
        .from('products')
        .select('*, profiles:seller_id(full_name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (plErr) throw plErr;
      setProducts((prodList as unknown as Product[]) ?? []);

    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      Promise.resolve().then(() => {
        fetchPlatformData();
      });
    }
  }, [user]);

  const handleDeactivate = async (productId: number) => {
    const ok = await deactivateProduct(productId);
    if (ok.success) {
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  if (isSessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto my-10 space-y-4">
        <span className="text-5xl">🔒</span>
        <h3 className="text-xl font-bold text-gray-800">Admin Area Guarded</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Please sign in as a system administrator to access the Control Panel.
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
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Platform Control Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Monitor platform-wide analytics and audit active crop listings.</p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/admin/verifications" passHref legacyBehavior>
            <Button variant="outline" className="gap-1.5 border-gray-200 hover:bg-gray-50">
              <Users className="w-4.5 h-4.5 text-gray-500" />
              Vendor Vetting
            </Button>
          </Link>
          <Link href="/admin/system-logs" passHref legacyBehavior>
            <Button variant="outline" className="gap-1.5 border-gray-200 hover:bg-gray-50">
              <FileText className="w-4.5 h-4.5 text-gray-500" />
              System Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* System Stats Overview */}
      <SystemOverviewCard stats={stats} />

      {/* Moderation Panel */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs space-y-4 p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Listed Crops Auditing</h3>
          <p className="text-xs text-gray-400 mt-1">Review active marketplace products. Deactivating a product soft-hides it from buyers.</p>
        </div>

        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden mt-4">
          {products.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center bg-gray-50/20">No active product listings listed on the platform.</p>
          ) : (
            products.map((product: Product) => (
              <ModerationRow
                key={product.id}
                type="product"
                id={product.id}
                title={product.title}
                subtitle={`Listed by: ${product.profiles?.full_name || 'Unknown seller'}`}
                details={`Price: ${formatPrice(Number(product.price))} | In Stock: ${product.stock_quantity}`}
                isModerated={product.is_active}
                onApprove={async () => true}
                onReject={async () => handleDeactivate(product.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
