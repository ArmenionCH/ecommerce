/**
 * PHASE 1 — BASE FEED ALGORITHM
 *
 * Sorts products by creation timestamp descending.
 * This is the default feed. Phase 2 swaps this for trendingAlgo.ts
 * without any changes to components or route files.
 *
 * Swap guide: In useProductLoader.ts, replace `baseFeed` import
 * with `trendingAlgo` import. Zero other changes required.
 */

import { supabaseClient } from '@/lib/supabase';
import type { Product }   from '@/lib/types';

/**
 * Fetches active products sorted by most recently listed.
 * @param limit - Max number of products to return (default 20)
 * @returns Array of active products
 */
export async function baseFeed(limit = 20): Promise<Product[]> {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[GreenMarket] baseFeed error:', error.message);
    return [];
  }

  return (data as Product[]) ?? [];
}
