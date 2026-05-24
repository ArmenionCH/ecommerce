'use server';

/**
 * REVIEW SUBMISSION SERVER ACTION
 *
 * Business Rule: Only customers who have a 'received' order
 * containing the product may submit a review.
 * RLS policy enforces this at the database layer as a second guard.
 */

import { createServerClient } from '@/lib/supabaseServer';

interface ReviewPayload {
  customerId : string;
  productId  : number;
  rating     : number;  // 1–5
  comment    : string | null;
}

interface ReviewResult {
  success: boolean;
  error? : string;
}

export async function submitReview(payload: ReviewPayload): Promise<ReviewResult> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('reviews')
    .insert({
      customer_id: payload.customerId,
      product_id : payload.productId,
      rating     : payload.rating,
      comment    : payload.comment,
    });

  if (error) {
    // RLS will block non-buyers with a policy violation error
    return { success: false, error: error.message };
  }

  return { success: true };
}
