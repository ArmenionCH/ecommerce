'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { ProductSalesReport } from '@/lib/types';

interface OrderItemRow {
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  order_id: number;
  orders: { status: string } | null;
}

export function useSellerProductReport(sellerId: string | null) {
  const [rows, setRows] = useState<ProductSalesReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: products, error: pErr } = await supabaseClient
          .from('products')
          .select('id, title, stock_quantity, is_active, price')
          .eq('seller_id', sellerId)
          .order('created_at', { ascending: false });

        if (pErr) throw pErr;

        const { data: items, error: iErr } = await supabaseClient
          .from('order_items')
          .select('product_id, quantity, price_at_purchase, order_id, orders(status)')
          .eq('seller_id', sellerId);

        if (iErr) throw iErr;

        const stats = new Map<
          number,
          { units_sold: number; revenue: number; order_ids: Set<number> }
        >();

        (items as unknown as OrderItemRow[] | null)?.forEach((item) => {
          if (item.orders?.status === 'cancelled') return;
          const lineTotal = Number(item.price_at_purchase) * item.quantity;
          const existing = stats.get(item.product_id) ?? {
            units_sold: 0,
            revenue: 0,
            order_ids: new Set<number>(),
          };
          existing.units_sold += item.quantity;
          existing.revenue += lineTotal;
          existing.order_ids.add(item.order_id);
          stats.set(item.product_id, existing);
        });

        const report: ProductSalesReport[] = (products ?? []).map((p) => {
          const s = stats.get(p.id);
          return {
            product_id: p.id,
            title: p.title,
            list_price: Number(p.price),
            stock_quantity: p.stock_quantity,
            is_active: p.is_active,
            units_sold: s?.units_sold ?? 0,
            revenue: s?.revenue ?? 0,
            orders_count: s?.order_ids.size ?? 0,
          };
        });

        report.sort((a, b) => b.revenue - a.revenue);
        setRows(report);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product report.');
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [sellerId]);

  return { rows, isLoading, error };
}
