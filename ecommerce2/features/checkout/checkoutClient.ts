import { supabaseClient } from '@/lib/supabase';
import { SHIPPING_FEE } from '@/lib/constants';
import type { OrderPlacementPayload, OrderPlacementResult } from '@/lib/types';

/**
 * Places an order from the browser so the Supabase session (JWT) is attached.
 * Server actions use a stateless anon client and break RLS / cause recursion issues.
 */
export async function placeOrderClient(
  payload: OrderPlacementPayload,
): Promise<OrderPlacementResult> {
  try {
    const productIds = payload.items.map((item) => item.product_id);

    const { data: products, error: priceError } = await supabaseClient
      .from('products')
      .select('id, price, seller_id')
      .in('id', productIds)
      .eq('is_active', true);

    if (priceError || !products?.length) {
      throw new Error(priceError?.message ?? 'Could not load product prices.');
    }

    const priceMap = new Map(products.map((p) => [p.id, Number(p.price)]));

    let subtotal = 0;
    const lines = payload.items.map((item) => {
      const dbPrice = priceMap.get(item.product_id);
      if (dbPrice === undefined) {
        throw new Error(`Product ${item.product_id} is unavailable.`);
      }
      subtotal += dbPrice * item.quantity;
      return {
        product_id: item.product_id,
        seller_id: item.seller_id,
        variation_id: item.variation_id,
        quantity: item.quantity,
        price_at_purchase: dbPrice,
      };
    });

    const grandTotal = subtotal + SHIPPING_FEE;

    const { data: orderRow, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: payload.customerId,
        total_amount: grandTotal,
        status: 'placed',
        shipping_address: payload.shippingAddress,
      })
      .select('id')
      .single();

    if (orderError || !orderRow) {
      throw new Error(orderError?.message ?? 'Order creation failed.');
    }

    const orderItemRows = lines.map((line) => ({
      order_id: orderRow.id,
      product_id: line.product_id,
      seller_id: line.seller_id,
      quantity: line.quantity,
      price_at_purchase: line.price_at_purchase,
      variation_details: line.variation_id ? `Variation ID: ${line.variation_id}` : null,
    }));

    const { error: itemsError } = await supabaseClient.from('order_items').insert(orderItemRows);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    await supabaseClient.from('cart_items').delete().eq('customer_id', payload.customerId);

    return { success: true, orderId: orderRow.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}
