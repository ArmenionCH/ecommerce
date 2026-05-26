'use client';

/**
 * CART ACTIONS HOOK
 * * Logic:
 * 1. Checks if an item with the same product_id AND variation_id exists for the user.
 * 2. If it exists, it increments the quantity (Stacking).
 * 3. If not, it creates a new row.
 * * Requirement: 
 * Must have the UNIQUE INDEX (customer_id, product_id, COALESCE(variation_id, -1)) 
 * applied in Supabase SQL Editor for the onConflict to trigger correctly.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { CartItem } from '@/lib/types';
import { usePageVisibility } from '@/components/layout/PageVisibilityProvider';

interface UseCartActionsReturn {
  cartItems: CartItem[];
  isLoading: boolean;
  addItem: (productId: number, variationId: number | null, qty: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQty: (cartItemId: number, newQty: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export function useCartActions(customerId: string | null): UseCartActionsReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const isVisible = usePageVisibility();

  // Load cart items with product join
  const loadCart = useCallback(async () => {
    // Prevent background tab reloads if not visible
    if (!isVisible || !customerId) {
      if (!customerId) {
        setCartItems([]);
        setLoading(false);
      }
      return;
    }

    const { data, error } = await supabaseClient
      .from('cart_items')
      .select('*, product:products(*), variation:product_variations(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true });

    if (!error) {
      setCartItems((data as CartItem[]) ?? []);
    }
    setLoading(false);
  }, [customerId, isVisible]);

  useEffect(() => {
    loadCart();

    // Listen for cart-updated events from other components
    const handleUpdate = () => loadCart();
    window.addEventListener('cart-updated', handleUpdate);

    return () => window.removeEventListener('cart-updated', handleUpdate);
  }, [loadCart]);

  const addItem = async (productId: number, variationId: number | null, qty: number) => {
    if (!customerId) return;

    try {
      // 1. CHECK: Find if the item is already in the cart
      const { data: existing } = await supabaseClient
        .from('cart_items')
        .select('id, quantity')
        .eq('customer_id', customerId)
        .eq('product_id', productId)
        // This filter is key for handling NULL variations
        .filter('variation_id', variationId ? 'eq' : 'is', variationId ?? null)
        .maybeSingle();

      if (existing) {
        // 2. UPDATE: If it exists, increment the quantity
        // Using .update() with .eq('id', ...) avoids the "unique constraint" check
        const { error: updateError } = await supabaseClient
          .from('cart_items')
          .update({ quantity: existing.quantity + qty })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        // Optimistic update for existing item
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === existing.id ? { ...item, quantity: existing.quantity + qty } : item
          )
        );
      } else {
        // 3. INSERT: If it doesn't exist, create a new row
        const { data: newItem, error: insertError } = await supabaseClient
          .from('cart_items')
          .insert({
            customer_id: customerId,
            product_id: productId,
            variation_id: variationId ?? null,
            quantity: qty,
          })
          .select('*, product:products(*), variation:product_variations(*)')
          .single();

        if (insertError) throw insertError;

        // Optimistic update for new item
        if (newItem) {
          setCartItems((prev) => [...prev, newItem as CartItem]);
        }
      }

      // 4. Final step: Refresh the UI to ensure consistency
      await loadCart();

      // Dispatch event to sync all cart instances
      window.dispatchEvent(new Event('cart-updated'));

    } catch (error: any) {
      // Change the label here so you know it's not an 'upsert' anymore
      console.error('Cart Logic Error:', error.message);
      // Reload cart on error to ensure consistency
      await loadCart();
    }
  };

  const removeItem = async (cartItemId: number) => {
    const { error } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (!error) {
      // Optimistic local update for speed
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      // Dispatch event to sync all cart instances
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const updateQty = async (cartItemId: number, newQty: number) => {
    if (newQty <= 0) {
      await removeItem(cartItemId);
      return;
    }

    const { error } = await supabaseClient
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', cartItemId);

    if (!error) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item
        )
      );
      // Dispatch event to sync all cart instances
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const clearCart = async () => {
    if (!customerId) return;
    const { error } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('customer_id', customerId);

    if (!error) {
      setCartItems([]);
      // Dispatch event to sync all cart instances
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  return { cartItems, isLoading, addItem, removeItem, updateQty, clearCart };
}