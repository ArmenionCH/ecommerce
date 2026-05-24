'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { SellerAnalytics } from '@/lib/types';

export function useSellerMetrics(sellerId: string | null) {
  const [metrics, setMetrics] = useState<SellerAnalytics | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<Array<{ name: string; earnings: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) {
      Promise.resolve().then(() => {
        setMetrics(null);
        setEarningsHistory([]);
        setIsLoading(false);
      });
      return;
    }

    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch from public.seller_analytics view
        const { data: analyticsData, error: aErr } = await supabaseClient
          .from('seller_analytics')
          .select('*')
          .eq('seller_id', sellerId)
          .maybeSingle();

        if (aErr) throw aErr;

        setMetrics(
          analyticsData || {
            seller_id: sellerId,
            total_earnings: 0,
            total_orders_handled: 0,
            pending_orders_count: 0,
            completed_orders_count: 0,
          }
        );

        // Fetch recent completed order items to build monthly statistics for the charting widget
        const { data: items, error: iErr } = await supabaseClient
          .from('order_items')
          .select('price_at_purchase, quantity, order_id, orders(created_at, status)')
          .eq('seller_id', sellerId);

        if (iErr) throw iErr;

        interface OrderItemWithOrder {
          price_at_purchase: number;
          quantity: number;
          order_id: number;
          orders: {
            created_at: string;
            status: string;
          } | null;
        }

        // Group by month to create chart dataset
        const monthlyMap: Record<string, number> = {};
        
        (items as unknown as OrderItemWithOrder[] | null)?.forEach((item) => {
          const order = item.orders;
          if (order && order.status !== 'cancelled') {
            const date = new Date(order.created_at);
            const monthName = date.toLocaleDateString('en-PH', { month: 'short' });
            const amount = Number(item.price_at_purchase) * item.quantity;
            monthlyMap[monthName] = (monthlyMap[monthName] || 0) + amount;
          }
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const history = months
          .map(m => ({
            name: m,
            earnings: monthlyMap[m] || 0,
          }));

        // Keep months with earnings or default to active months
        setEarningsHistory(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch seller metrics.');
      } finally {
        setIsLoading(false);
      }
    };

    Promise.resolve().then(() => {
      fetchMetrics();
    });
  }, [sellerId]);

  return { metrics, earningsHistory, isLoading, error };
}
