import { supabaseClient } from '@/lib/supabase';

export async function approveSeller(sellerId: string): Promise<{ success: boolean; error?: string }> {
  const { data: row, error: fetchError } = await supabaseClient
    .from('profiles')
    .select('metadata')
    .eq('id', sellerId)
    .eq('role', 'seller')
    .single();

  if (fetchError || !row) {
    return { success: false, error: fetchError?.message ?? 'Seller not found' };
  }

  const metadata = {
    ...(typeof row.metadata === 'object' && row.metadata !== null ? row.metadata : {}),
    is_verified: true,
    verification_status: 'approved',
  };

  const { error } = await supabaseClient
    .from('profiles')
    .update({ metadata })
    .eq('id', sellerId)
    .eq('role', 'seller');

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function rejectSeller(sellerId: string): Promise<{ success: boolean; error?: string }> {
  const { data: row, error: fetchError } = await supabaseClient
    .from('profiles')
    .select('metadata')
    .eq('id', sellerId)
    .eq('role', 'seller')
    .single();

  if (fetchError || !row) {
    return { success: false, error: fetchError?.message ?? 'Seller not found' };
  }

  const metadata = {
    ...(typeof row.metadata === 'object' && row.metadata !== null ? row.metadata : {}),
    is_verified: false,
    verification_status: 'rejected',
  };

  const { error } = await supabaseClient
    .from('profiles')
    .update({ metadata })
    .eq('id', sellerId)
    .eq('role', 'seller');

  if (error) return { success: false, error: error.message };

  await supabaseClient.from('products').update({ is_active: false }).eq('seller_id', sellerId);

  return { success: true };
}
