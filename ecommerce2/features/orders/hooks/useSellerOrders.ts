'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/lib/types';
import { usePageVisibility } from '@/components/layout/PageVisibilityProvider';

export function useSellerOrders(sellerId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isVisible = usePageVisibility();

  const fetchOrders = useCallback(async () => {
    // Don't fetch if tab is hidden
    if (!isVisible) return;

    if (!sellerId) return;
    setError(null);
    try {
      // Fetch orders that contain items from this seller
      const { data, error: err } = await supabaseClient
        .from('orders')
        .select('*, order_items(*)')
        .in('status', ['placed', 'to_receive'])
        .order('created_at', { ascending: false });

      if (err) throw err;

      // Filter orders to only include those with items from this seller
      const sellerOrders = (data as Order[]).filter(order =>
        order.order_items?.some(item => item.seller_id === sellerId)
      );

      // Count unread orders (newly placed orders)
      const newOrders = sellerOrders.filter(order => order.status === 'placed').length;

      setOrders(sellerOrders);
      setUnreadCount(newOrders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch seller orders.');
    } finally {
      setIsLoading(false);
    }
  }, [sellerId, isVisible]);

  const updateOrderStatus = useCallback(async (
    orderId: number,
    newStatus: OrderStatus,
    sellerId: string
  ) => {
    try {
      const { error } = await supabaseClient
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders after update
      await fetchOrders();

      // Dispatch event to sync across components
      window.dispatchEvent(new Event('orders-updated'));
    } catch (e) {
      console.error('Failed to update order status:', e);
      throw e;
    }
  }, [fetchOrders]);

  const approveOrder = useCallback(async (orderId: number, sellerId: string) => {
    try {
      // First, get the order items to update inventory
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .select('order_items(*)')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Update inventory for each item in the order
      for (const item of order.order_items || []) {
        if (item.seller_id === sellerId) {
          // Update product stock
          const { data: product } = await supabaseClient
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (product) {
            const newStock = Math.max(0, product.stock_quantity - item.quantity);
            await supabaseClient
              .from('products')
              .update({ stock_quantity: newStock })
              .eq('id', item.product_id);
          }

          // Update variation stock if applicable
          if (item.variation_details) {
            const { data: variation } = await supabaseClient
              .from('product_variations')
              .select('stock_quantity')
              .eq('id', item.product_id)
              .single();

            if (variation) {
              const newVarStock = Math.max(0, variation.stock_quantity - item.quantity);
              await supabaseClient
                .from('product_variations')
                .update({ stock_quantity: newVarStock })
                .eq('id', item.product_id);
            }
          }
        }
      }

      // Then update order status to "on the way"
      await updateOrderStatus(orderId, 'to_receive', sellerId);
    } catch (e) {
      console.error('Failed to approve order:', e);
      throw e;
    }
  }, [updateOrderStatus]);

  const rejectOrder = useCallback(async (orderId: number, sellerId: string) => {
    await updateOrderStatus(orderId, 'cancelled', sellerId);
  }, [updateOrderStatus]);

  useEffect(() => {
    if (!sellerId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    fetchOrders();

    // Listen for orders-updated events from other components
    const handleUpdate = () => fetchOrders();
    window.addEventListener('orders-updated', handleUpdate);

    // Set up Realtime subscription for new orders
    const channelName = `seller_orders_realtime_${sellerId}_${Date.now()}`;
    const channel = supabaseClient
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async () => {
          // Only fetch if tab is visible
          if (isVisible) {
            await fetchOrders();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        async () => {
          // Only fetch if tab is visible
          if (isVisible) {
            await fetchOrders();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[SellerOrders] Realtime subscription established');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('[SellerOrders] Realtime subscription closed/error');
        }
      });

    return () => {
      window.removeEventListener('orders-updated', handleUpdate);
      supabaseClient.removeChannel(channel);
    };
  }, [sellerId, fetchOrders, isVisible]);

  return {
    orders,
    isLoading,
    error,
    unreadCount,
    approveOrder,
    rejectOrder,
    refreshOrders: fetchOrders,
  };
}
