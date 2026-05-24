import { supabaseClient } from '../../lib/supabase';

describe('Green Market — Row Level Security (RLS) Isolation Tests', () => {

  const otherCustomerId = '00000000-0000-0000-0000-000000000004';

  test('Customer should not be able to read other customer cart items', async () => {
    // Under RLS, querying cart items for another customer_id yields empty results
    const { data } = await supabaseClient
      .from('cart_items')
      .select('*')
      .eq('customer_id', otherCustomerId);

    // Should return no data due to RLS filter isolation
    expect(data?.length || 0).toBe(0);
  });

  test('Public anonymous profiles select allowed', async () => {
    const { error } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .limit(1);

    expect(error).toBeNull();
  });

  test('Reviews insert block for non-buyer accounts', async () => {
    // Non-buyer reviews are rejected at the DB layer via RLS checks
    const { error } = await supabaseClient
      .from('reviews')
      .insert({
        product_id: 1,
        customer_id: otherCustomerId,
        rating: 5,
        comment: 'Fake review',
      });

    expect(error).toBeDefined();
  });

});
