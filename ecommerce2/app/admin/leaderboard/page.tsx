'use client';

import React, { useEffect, useState } from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Star, Clock, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface SellerPerformance {
  seller_id: string;
  total_orders: number;
  total_revenue: number;
  average_fulfillment_time_hours: number | null;
  return_rate: number;
  average_rating: number;
  total_reviews: number;
  seller: Profile;
}

export default function AdminLeaderboardPage() {
  const { user, isLoading: isSessionLoading } = useUserSession();
  const [sellers, setSellers] = useState<SellerPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'rating' | 'speed'>('revenue');

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('seller_performance')
        .select('*, seller:seller_id(*)')
        .order('total_revenue', { ascending: false });

      if (error) throw error;
      setSellers((data as any) ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchSellers();
    }
  }, [user]);

  const sortedSellers = [...sellers].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.total_revenue - a.total_revenue;
      case 'orders':
        return b.total_orders - a.total_orders;
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'speed':
        return (a.average_fulfillment_time_hours || Infinity) - (b.average_fulfillment_time_hours || Infinity);
      default:
        return 0;
    }
  });

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
          Please sign in as a system administrator to view seller leaderboard.
        </p>
        <Link href="/admin">
          <Button variant="outline">Back to admin dashboard</Button>
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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Seller Performance Leaderboard</h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Track seller performance metrics including revenue, orders, ratings, and fulfillment speed.
        </p>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSortBy('revenue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
            sortBy === 'revenue'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-1" />
          Revenue
        </button>
        <button
          onClick={() => setSortBy('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
            sortBy === 'orders'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setSortBy('rating')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
            sortBy === 'rating'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
          }`}
        >
          <Star className="w-4 h-4 inline mr-1" />
          Rating
        </button>
        <button
          onClick={() => setSortBy('speed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
            sortBy === 'speed'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-1" />
          Speed
        </button>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {sortedSellers.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center bg-gray-50/20">No seller performance data yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedSellers.map((seller, index) => (
              <div key={seller.seller_id} className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{seller.seller.full_name}</h3>
                      {seller.seller.is_verified && (
                        <Award className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Phone: {seller.seller.phone_number || 'N/A'} · {seller.total_reviews} reviews
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-xs text-emerald-600 font-semibold">Total Revenue</p>
                    <p className="text-lg font-bold text-emerald-900">{formatPrice(seller.total_revenue)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-semibold">Total Orders</p>
                    <p className="text-lg font-bold text-blue-900">{seller.total_orders}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-semibold">Avg Rating</p>
                    <p className="text-lg font-bold text-purple-900">{seller.average_rating?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 font-semibold">Fulfillment Time</p>
                    <p className="text-lg font-bold text-orange-900">{seller.average_fulfillment_time_hours ? `${seller.average_fulfillment_time_hours.toFixed(1)}h` : 'N/A'}</p>
                  </div>
                </div>

                {seller.return_rate > 0 && (
                  <div className="bg-rose-50 rounded-lg p-3">
                    <p className="text-xs text-rose-600 font-semibold">Return Rate</p>
                    <p className="text-sm text-rose-700">{(seller.return_rate * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
