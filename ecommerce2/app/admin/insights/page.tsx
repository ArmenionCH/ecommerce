'use client';

import React, { useEffect, useState } from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, TrendingUp, Search, Repeat, Crown } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface CustomerLTV {
  customer_id: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  first_purchase_date: string | null;
  last_purchase_date: string | null;
  days_since_last_purchase: number | null;
  is_vip: boolean;
  customer: Profile;
}

interface SearchTrend {
  id: string;
  search_query: string;
  search_count: number;
  category: string | null;
  last_searched_at: string;
}

export default function AdminInsightsPage() {
  const { user, isLoading: isSessionLoading } = useUserSession();
  const [customers, setCustomers] = useState<CustomerLTV[]>([]);
  const [searchTrends, setSearchTrends] = useState<SearchTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'search'>('customers');

  const fetchInsights = async () => {
    try {
      const [customersResult, searchResult] = await Promise.all([
        supabaseClient
          .from('customer_ltv')
          .select('*, customer:customer_id(*)')
          .order('total_spent', { ascending: false })
          .limit(50),
        supabaseClient
          .from('search_trends')
          .select('*')
          .order('search_count', { ascending: false })
          .limit(20),
      ]);

      const { data: customersData, error: cErr } = customersResult;
      const { data: searchData, error: sErr } = searchResult;

      if (cErr) throw cErr;
      if (sErr) throw sErr;

      setCustomers((customersData as any) ?? []);
      setSearchTrends((searchData as any) ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchInsights();
    }
  }, [user]);

  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const vipCustomers = customers.filter(c => c.is_vip);
  const totalSearches = searchTrends.reduce((sum, s) => sum + s.search_count, 0);

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
          Please sign in as a system administrator to view buyer insights.
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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Buyer Insights</h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Analyze customer behavior, lifetime value, and search trends.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Total Customers</p>
              <p className="text-xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">VIP Customers</p>
              <p className="text-xl font-bold text-gray-900">{vipCustomers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-50">
              <Search className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Total Searches</p>
              <p className="text-xl font-bold text-gray-900">{totalSearches}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
            activeTab === 'customers'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Customer LTV
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
            activeTab === 'search'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
          }`}
        >
          <Search className="w-4 h-4 inline mr-1" />
          Search Trends
        </button>
      </div>

      {/* Customer LTV */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {customers.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center bg-gray-50/20">No customer data yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <div key={customer.customer_id} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{customer.customer.full_name}</h3>
                          {customer.is_vip && (
                            <Crown className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Phone: {customer.customer.phone_number || 'N/A'} · {customer.total_orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-emerald-600">{formatPrice(customer.total_spent)}</p>
                      <p className="text-xs text-gray-400">Lifetime Value</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Avg Order Value</p>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(customer.average_order_value)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Last Purchase</p>
                      <p className="text-sm font-bold text-gray-900">
                        {customer.last_purchase_date ? new Date(customer.last_purchase_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Days Since Last</p>
                      <p className="text-sm font-bold text-gray-900">{customer.days_since_last_purchase ?? 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Trends */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {searchTrends.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center bg-gray-50/20">No search data yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {searchTrends.map((trend) => (
                <div key={trend.id} className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{trend.search_query}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {trend.category || 'No category'} · Last searched {new Date(trend.last_searched_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-emerald-600">{trend.search_count}</p>
                    <p className="text-xs text-gray-400">searches</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
