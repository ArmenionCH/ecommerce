'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Order } from '@/lib/types';

export function useOrderStatus(customerId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
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
  }, [customerId]);

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
          // Trigger a re-fetch of orders to get updated statuses and associations
          await fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [customerId, fetchOrders]);

  return { orders, isLoading, error, refreshOrders: fetchOrders };
}
