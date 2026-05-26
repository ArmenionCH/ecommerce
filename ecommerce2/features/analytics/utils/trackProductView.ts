import { supabaseClient } from '@/lib/supabase';

export async function trackProductView(productId: number) {
  try {
    // Increment view count
    const { error: updateError } = await supabaseClient.rpc('increment_product_view', {
      p_product_id: productId
    });

    if (updateError) {
      // Fallback: try direct update if RPC doesn't exist
      const { data: existing } = await supabaseClient
        .from('product_metrics')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (existing) {
        await supabaseClient
          .from('product_metrics')
          .update({
            total_views: existing.total_views + 1,
            last_viewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('product_id', productId);
      } else {
        await supabaseClient
          .from('product_metrics')
          .insert({
            product_id: productId,
            total_views: 1,
            total_adds_to_cart: 0,
            total_purchases: 0,
            last_viewed_at: new Date().toISOString(),
          });
      }
    }
  } catch (err) {
    console.error('Failed to track product view:', err);
  }
}
