'use server';

/**
 * ADMIN CONTROL SERVER ACTIONS
 *
 * All actions require admin role (enforced by RLS + server-side role check).
 * These are the only functions that can write to profiles.metadata
 * or toggle product is_active outside of the owning seller.
 */

import { createServerClient } from '@/lib/supabaseServer';

/** Approve a seller vendor account by setting is_verified in metadata */
export async function approveVendor(sellerId: string): Promise<{ success: boolean }> {
  const supabase = createServerClient();
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ metadata: { is_verified: true } })
      .eq('id', sellerId)
      .eq('role', 'seller');

    return { success: !error };
  } catch (err) {
    console.error('approveVendor error:', err);
    return { success: false };
  }
}

/** Soft-deactivate a product (never hard delete) */
export async function deactivateProduct(productId: number): Promise<{ success: boolean }> {
  const supabase = createServerClient();
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);

    return { success: !error };
  } catch (err) {
    console.error('deactivateProduct error:', err);
    return { success: false };
  }
}

/** Update an order's status (admin override path) */
export async function updateOrderStatus(
  orderId : number,
  status  : 'placed' | 'packed' | 'to_receive' | 'received' | 'cancelled'
): Promise<{ success: boolean }> {
  const supabase = createServerClient();
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    return { success: !error };
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return { success: false };
  }
}
