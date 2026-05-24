'use client';

import React, { useEffect, useState } from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { supabaseClient } from '@/lib/supabase';
import { ModerationRow } from '@/features/admin-control/components/ModerationRow';
import { approveSeller, rejectSeller } from '@/features/admin-control/adminClient';
import { LinkButton } from '@/components/ui/link-button';
import { getSellerVerification } from '@/lib/sellerVerification';
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
    const result = await approveSeller(sellerId);
    if (result.success) {
      await fetchSellers();
      return true;
    }
    console.error(result.error);
    return false;
  };

  const handleReject = async (sellerId: string) => {
    const result = await rejectSeller(sellerId);
    if (result.success) {
      await fetchSellers();
      return true;
    }
    console.error(result.error);
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
          Please sign in as a system administrator to review seller applications.
        </p>
        <LinkButton href="/admin" variant="outline">
          Back to admin dashboard
        </LinkButton>
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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Seller applications</h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          New sellers register as &quot;Sell products&quot; and start as <strong>pending</strong>. After you
          approve them, their listings appear on the public marketplace. Rejecting hides their products.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm p-6 space-y-4">
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {sellers.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center bg-gray-50/20">No seller accounts yet.</p>
          ) : (
            sellers.map((seller) => {
              const metadata = seller.metadata as { shop_name?: string } | undefined;
              const { isVerified, status } = getSellerVerification(seller);
              const shopName = metadata?.shop_name || 'Unnamed shop';

              return (
                <ModerationRow
                  key={seller.id}
                  type="seller"
                  id={seller.id}
                  title={seller.full_name}
                  subtitle={`Shop: ${shopName} · Status: ${status} · Tel: ${seller.phone_number || 'N/A'}`}
                  details={`Address: ${seller.delivery_address || 'Not provided'} · Applied ${new Date(seller.created_at).toLocaleDateString()}`}
                  isModerated={isVerified}
                  onApprove={async () => handleApprove(seller.id)}
                  onReject={async () => handleReject(seller.id)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
