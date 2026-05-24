'use client';

import React, { useEffect, useState } from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface SystemLog {
  type: string;
  message: string;
  timestamp: string;
  color: string;
}

export default function AdminSystemLogsPage() {
  const { user, isLoading: isSessionLoading } = useUserSession();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Gather activity feeds chronologically from profiles, products, and orders tables
      const { data: profiles } = await supabaseClient
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: products } = await supabaseClient
        .from('products')
        .select('id, title, created_at, is_active')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: orders } = await supabaseClient
        .from('orders')
        .select('id, status, created_at, total_amount')
        .order('created_at', { ascending: false })
        .limit(10);

      const aggregatedLogs: SystemLog[] = [];

      profiles?.forEach((p) => {
        aggregatedLogs.push({
          type: 'USER_REGISTRATION',
          message: `User ${p.full_name} registered as a ${p.role}.`,
          timestamp: p.created_at,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        });
      });

      products?.forEach((pr) => {
        aggregatedLogs.push({
          type: pr.is_active ? 'PRODUCT_LISTED' : 'PRODUCT_DEACTIVATED',
          message: `Product Listing "${pr.title}" (ID: ${pr.id}) ${pr.is_active ? 'was published' : 'was soft-deactivated'}.`,
          timestamp: pr.created_at,
          color: pr.is_active ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100',
        });
      });

      orders?.forEach((o) => {
        aggregatedLogs.push({
          type: `ORDER_${o.status.toUpperCase()}`,
          message: `Order #${o.id} was placed with COD total of ₱${Number(o.total_amount).toFixed(2)}. Status is "${o.status}".`,
          timestamp: o.created_at,
          color: 'text-amber-600 bg-amber-50 border-amber-100',
        });
      });

      // Sort logs by timestamp DESC
      aggregatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(aggregatedLogs.slice(0, 20));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      Promise.resolve().then(() => {
        fetchLogs();
      });
    }
  }, [user]);

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
          Please sign in as a system administrator to access the System Log audits.
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Platform Overview
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">System Audit Logs</h1>
          <p className="text-sm text-gray-400 mt-1">Review chronological event updates triggered across the marketplace databases.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-1.5 border-gray-200">
          <RefreshCw className="w-4 h-4 text-gray-500" />
          Refresh Audit
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs p-6">
        <div className="space-y-3.5">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center bg-gray-50/20">No system events logged in this session.</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-50 rounded-2xl bg-white hover:bg-gray-50/20 transition-colors gap-3"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${log.color}`}>
                    {log.type}
                  </span>
                  <p className="text-xs font-semibold text-gray-700">{log.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0">
                  {new Date(log.timestamp).toLocaleString('en-PH')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
