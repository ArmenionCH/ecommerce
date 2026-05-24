'use client';

/**
 * CART ACTIONS HOOK
 *
 * All cart mutations go through this hook. QuantityInput.tsx must
 * NEVER directly access Supabase or session state — it calls this hook.
 * The DB trigger tr_enforce_cart_stock handles quantity clamping.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient }                   from '@/lib/supabase';
import type { CartItem }                    from '@/lib/types';

interface UseCartActionsReturn {
  cartItems   : CartItem[];
  isLoading   : boolean;
  addItem     : (productId: number, variationId: number | null, qty: number) => Promise<void>;
  removeItem  : (cartItemId: number) => Promise<void>;
  updateQty   : (cartItemId: number, newQty: number) => Promise<void>;
  clearCart   : () => Promise<void>;
}

export function useCartActions(customerId: string | null): UseCartActionsReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setLoading]   = useState<boolean>(true);

  // Load cart items with product join
  const loadCart = useCallback(async () => {
    if (!customerId) { setCartItems([]); setLoading(false); return; }

    const { data } = await supabaseClient
      .from('cart_items')
      .select('*, product:products(*), variation:product_variations(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true });

    setCartItems((data as CartItem[]) ?? []);
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadCart();
    });
  }, [loadCart]);

  const addItem = async (productId: number, variationId: number | null, qty: number) => {
    if (!customerId) return;
    // Upsert — DB trigger will clamp quantity to available stock
    await supabaseClient
      .from('cart_items')
      .upsert({
        customer_id : customerId,
        product_id  : productId,
        variation_id: variationId,
        quantity    : qty,
      }, { onConflict: 'customer_id,product_id,variation_id' });

    await loadCart();
  };

  const removeItem = async (cartItemId: number) => {
    await supabaseClient.from('cart_items').delete().eq('id', cartItemId);
    await loadCart();
  };

  const updateQty = async (cartItemId: number, newQty: number) => {
    if (newQty <= 0) { await removeItem(cartItemId); return; }
    // DB trigger clamps to max available stock
    await supabaseClient
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', cartItemId);
    await loadCart();
  };

  const clearCart = async () => {
    if (!customerId) return;
    await supabaseClient.from('cart_items').delete().eq('customer_id', customerId);
    setCartItems([]);
  };

  return { cartItems, isLoading, addItem, removeItem, updateQty, clearCart };
}
