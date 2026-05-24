'use client';

import React, { useEffect, useState } from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { supabaseClient } from '@/lib/supabase';
import { ModerationRow } from '@/features/admin-control/components/ModerationRow';
import { approveVendor } from '@/features/admin-control/actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';

export default function AdminVerificationsPage() {
  const { user, isLoading: isSessionLoading } = useUserSession();
  const [sellers, setSellers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSellers((data as Profile[]) ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      Promise.resolve().then(() => {
        fetchSellers();
      });
    }
  }, [user]);

  const handleApprove = async (sellerId: string) => {
    const ok = await approveVendor(sellerId);
    if (ok.success) {
      await fetchSellers();
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
          Please sign in as a system administrator to access the Vetting Console.
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
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Platform Overview
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Farmer Shop Vettings</h1>
        <p className="text-sm text-gray-400 mt-1">Vet registered vendor accounts before permitting public catalog listing.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs p-6 space-y-4">
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
          {sellers.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center bg-gray-50/20">No registered sellers found on the platform.</p>
          ) : (
            sellers.map((seller) => {
              const metadata = seller.metadata as { is_verified?: boolean; shop_name?: string } | undefined;
              const isVerified = !!metadata?.is_verified;
              const shopName = metadata?.shop_name || 'Unnamed Local Farm';

              return (
                <ModerationRow
                  key={seller.id}
                  type="seller"
                  id={seller.id}
                  title={seller.full_name}
                  subtitle={`Shop Name: ${shopName} | Tel: ${seller.phone_number || 'N/A'}`}
                  details={`Registered Address: ${seller.delivery_address || 'No Address Listed'}`}
                  isModerated={isVerified}
                  onApprove={async () => handleApprove(seller.id)}
                  onReject={async () => true}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
