/**
 * SERVER-SIDE ORDER CALCULATION ENGINE
 *
 * SECURITY CONTRACT:
 *   - This function NEVER accepts prices from the client.
 *   - It re-fetches every product price from the database using product_id.
 *   - This defeats price-manipulation attacks entirely.
 *   - Must only be called from server actions (features/checkout/actions.ts).
 */

import { createServerClient }      from '@/lib/supabaseServer';
import { SHIPPING_FEE }            from '@/lib/constants';
import type { OrderPlacementPayload } from '@/lib/types';

export interface CalculatedLine {
  product_id        : number;
  seller_id         : string;
  variation_id      : number | null;
  quantity          : number;
  price_at_purchase : number;  // From DB — not from client
  variation_details?: string;
}

export interface CalculationResult {
  lines        : CalculatedLine[];
  subtotal     : number;
  shippingFee  : number;
  grandTotal   : number;
}

/**
 * Fetches authoritative prices from DB and computes the final order total.
 * @param payload - Order payload from the client (prices intentionally excluded)
 * @returns Calculated totals and immutable line items
 */
export async function calculateOrderTotal(
  payload: OrderPlacementPayload
): Promise<CalculationResult> {
  const supabase = createServerClient();

  const productIds = payload.items.map(item => item.product_id);

  // Fetch authoritative prices in a single query
  const { data: products, error } = await supabase
    .from('products')
    .select('id, price, title')
    .in('id', productIds)
    .eq('is_active', true);

  if (error || !products) {
    throw new Error(`Price fetch failed: ${error?.message ?? 'No products returned'}`);
  }

  // Map product prices for O(1) lookup
  const priceMap = new Map<number, number>(
    products.map(p => [p.id, Number(p.price)])
  );

  let subtotal = 0;

  const lines: CalculatedLine[] = payload.items.map(item => {
    const dbPrice = priceMap.get(item.product_id);

    if (dbPrice === undefined) {
      throw new Error(`Product ${item.product_id} not found or inactive.`);
    }

    const lineTotal = dbPrice * item.quantity;
    subtotal += lineTotal;

    return {
      product_id        : item.product_id,
      seller_id         : item.seller_id,
      variation_id      : item.variation_id,
      quantity          : item.quantity,
      price_at_purchase : dbPrice,
    };
  });

  return {
    lines,
    subtotal,
    shippingFee : SHIPPING_FEE,
    grandTotal  : subtotal + SHIPPING_FEE,
  };
}
