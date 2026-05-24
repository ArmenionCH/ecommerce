'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import type { ProductSalesReport as ProductSalesRow } from '@/lib/types';
import { BarChart3, Package } from 'lucide-react';
import { LinkButton } from '@/components/ui/link-button';

interface ProductSalesReportProps {
  rows: ProductSalesRow[];
  isLoading: boolean;
  error: string | null;
}

export function ProductSalesReport({ rows, isLoading, error }: ProductSalesReportProps) {
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const totalUnits = rows.reduce((sum, r) => sum + r.units_sold, 0);

  return (
    <Card className="border border-gray-100 bg-white rounded-3xl overflow-hidden col-span-1 lg:col-span-4">
      <CardHeader className="border-b border-gray-50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Product sales report</CardTitle>
              <CardDescription>
                Performance of your listings — units sold, revenue, and remaining stock.
              </CardDescription>
            </div>
          </div>
          {!isLoading && rows.length > 0 && (
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-400 text-xs font-semibold uppercase block">Total revenue</span>
                <span className="font-black text-emerald-600">{formatPrice(totalRevenue)}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-semibold uppercase block">Units sold</span>
                <span className="font-black text-gray-800">{totalUnits}</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600" />
          </div>
        ) : error ? (
          <p className="text-sm text-rose-600 p-6">{error}</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 px-6 space-y-3">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500">No products yet. Add listings to start tracking sales.</p>
            <LinkButton href="/seller/inventory" size="sm">
              Manage inventory
            </LinkButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4 text-right">List price</th>
                  <th className="py-3.5 px-4 text-right">Units sold</th>
                  <th className="py-3.5 px-4 text-right">Orders</th>
                  <th className="py-3.5 px-4 text-right">Revenue</th>
                  <th className="py-3.5 px-6 text-right">Stock left</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.product_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{row.title}</span>
                        {!row.is_active && (
                          <Badge variant="outline" className="text-[10px] text-gray-500">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-600">{formatPrice(row.list_price)}</td>
                    <td className="py-4 px-4 text-right font-medium text-gray-800">{row.units_sold}</td>
                    <td className="py-4 px-4 text-right text-gray-600">{row.orders_count}</td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-600">
                      {formatPrice(row.revenue)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={
                          row.stock_quantity <= 0
                            ? 'text-rose-600 font-semibold'
                            : 'text-gray-600'
                        }
                      >
                        {row.stock_quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
