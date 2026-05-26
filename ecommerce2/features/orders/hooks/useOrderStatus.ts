'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Order } from '@/lib/types';
import { usePageVisibility } from '@/components/layout/PageVisibilityProvider';

export function useOrderStatus(customerId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isVisible = usePageVisibility();

  const fetchOrders = useCallback(async () => {
    // Don't fetch if tab is hidden
    if (!isVisible) return;

    if (!customerId) return;
    setError(null);
    try {
      const { data, error: err } = await supabaseClient
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setOrders((data as Order[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch orders.');
    } finally {
      setIsLoading(false);
    }
  }, [customerId, isVisible]);

  useEffect(() => {
    if (!customerId) {
      Promise.resolve().then(() => {
        setOrders([]);
        setIsLoading(false);
      });
      return;
    }

    Promise.resolve().then(() => {
      setIsLoading(true);
      fetchOrders();
    });

    // Set up Realtime subscription to public.orders table
    const channel = supabaseClient
      .channel(`orders_realtime_${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${customerId}`,
        },
        async () => {
          // Only re-fetch if tab is visible
          if (isVisible) {
            await fetchOrders();
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [customerId, fetchOrders, isVisible]);

  return { orders, isLoading, error, refreshOrders: fetchOrders };
}
