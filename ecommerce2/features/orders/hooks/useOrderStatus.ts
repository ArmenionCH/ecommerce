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
      console.log('[fetchOrders] Fetching orders for customer', customerId);
      const { data, error: err } = await supabaseClient
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      const orders = (data as Order[]) ?? [];
      console.log('[fetchOrders] Fetched orders:', orders.length);
      console.log('[fetchOrders] Order statuses:', orders.map(o => ({ id: o.id, status: o.status })));
      setOrders(orders);
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

  const cancelOrder = useCallback(async (orderId: number) => {
    if (!customerId) return;
    try {
      console.log('[cancelOrder] Attempting to cancel order', orderId, 'for customer', customerId);

      const { data, error, count } = await supabaseClient
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('customer_id', customerId)
        .select();

      console.log('[cancelOrder] Update result:', { data, error, count });

      if (error) {
        console.error('[cancelOrder] Database error:', error);
        throw error;
      }

      if (count === 0) {
        console.error('[cancelOrder] No rows updated - order may not exist or customer_id mismatch');
        throw new Error('Order not found or permission denied');
      }

      console.log('[cancelOrder] Successfully cancelled order', orderId, 'refreshing orders...');

      // Refresh orders after update
      await fetchOrders();

      console.log('[cancelOrder] Orders refreshed, dispatching event...');

      // Dispatch event to sync across components
      window.dispatchEvent(new Event('orders-updated'));

      console.log('[cancelOrder] Event dispatched');
    } catch (e) {
      console.error('[cancelOrder] Failed to cancel order:', e);
      throw e;
    }
  }, [customerId, fetchOrders]);

  return { orders, isLoading, error, refreshOrders: fetchOrders, cancelOrder };
}
