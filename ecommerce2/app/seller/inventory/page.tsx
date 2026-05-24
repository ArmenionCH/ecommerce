'use client';

import React, { useEffect, useState } from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const productSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Please describe your harvest (min 10 characters)' }),
  price: z.coerce.number().min(1, { message: 'Price must be at least ₱1.00' }),
  stockQuantity: z.coerce.number().min(1, { message: 'Stock quantity must be at least 1 unit' }),
  imageUrl: z.string().url({ message: 'Must be a valid image URL' }).or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function SellerInventoryPage() {
  const { user, isLoading: isSessionLoading } = useUserSession();
  const sellerId = user && user.role === 'seller' ? user.id : null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
  });

  const fetchInventory = React.useCallback(async () => {
    if (!sellerId) return;
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('is_active', true) // Only show active products
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data as Product[]) ?? []);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) {
      Promise.resolve().then(() => {
        fetchInventory();
      });
    }
  }, [sellerId, fetchInventory]);

  const handleAddProduct = async (data: ProductFormData) => {
    if (!sellerId) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await supabaseClient.from('products').insert({
        seller_id: sellerId,
        title: data.title,
        description: data.description,
        price: data.price,
        stock_quantity: data.stockQuantity,
        image_url: data.imageUrl || null,
        is_active: true,
      });

      if (error) throw error;
      reset();
      setIsAddOpen(false);
      await fetchInventory();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to list product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (productId: number) => {
    if (!confirm('Are you sure you want to deactivate this listing? It will be soft-deleted.')) return;
    try {
      const { error } = await supabaseClient
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (error) throw error;
      await fetchInventory();
    } catch (err) {
      console.error('Deactivation error:', err);
      alert('Deactivation failed.');
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'seller') {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto my-10 space-y-4">
        <span className="text-5xl">🔒</span>
        <h3 className="text-xl font-bold text-gray-800">Inventory Guarded</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Please sign in as a farmer/seller to manage product stock listings.
        </p>
        <Link href="/" passHref legacyBehavior>
          <Button variant="outline" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Header & Listing Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/seller" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Seller Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Manage Harvest Stock</h1>
          <p className="text-sm text-gray-400 mt-1">List new crops or adjust current warehouses storage limits.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 shadow-xs">
              <Plus className="w-4.5 h-4.5" />
              List New Harvest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-6 border-0 bg-white rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">List New Harvest</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleAddProduct)} className="space-y-4 mt-2">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Harvest Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Premium Native Batuan Fruit"
                  error={!!errors.title}
                  disabled={isSubmitting}
                  {...register('title')}
                />
                {errors.title && <p className="text-xs text-rose-500 font-medium">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Crop Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe freshness, harvest location, package sizes, shelf life..."
                  disabled={isSubmitting}
                  className={`flex w-full rounded-xl border bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.description
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200/50'
                      : 'border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-200/50'
                  }`}
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Price (₱)</label>
                  <Input
                    type="number"
                    placeholder="180"
                    error={!!errors.price}
                    disabled={isSubmitting}
                    {...register('price')}
                  />
                  {errors.price && <p className="text-xs text-rose-500 font-medium">{errors.price.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Stock (Qty)</label>
                  <Input
                    type="number"
                    placeholder="25"
                    error={!!errors.stockQuantity}
                    disabled={isSubmitting}
                    {...register('stockQuantity')}
                  />
                  {errors.stockQuantity && <p className="text-xs text-rose-500 font-medium">{errors.stockQuantity.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Crop Image URL</label>
                <Input
                  type="text"
                  placeholder="https://..."
                  error={!!errors.imageUrl}
                  disabled={isSubmitting}
                  {...register('imageUrl')}
                />
                {errors.imageUrl && <p className="text-xs text-rose-500 font-medium">{errors.imageUrl.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 mt-2">
                {isSubmitting ? 'Submitting crop listing...' : 'Publish Listing'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory Listings Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-lg mx-auto">
          <span className="text-4xl">🥬</span>
          <h3 className="text-lg font-bold text-gray-800 mt-4">No Harvests Listed</h3>
          <p className="text-sm text-gray-500 mt-2">
            You don&apos;t have any active produce listings. Click &quot;List New Harvest&quot; to publish your first crop.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4.5 px-6">Product</th>
                  <th className="py-4.5 px-6">Stock Status</th>
                  <th className="py-4.5 px-6">Price</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-emerald-50/30 overflow-hidden flex-shrink-0 border border-gray-50 flex items-center justify-center">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">🥬</span>
                          )}
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800 line-clamp-1">{product.title}</h5>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description || 'No description.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {product.stock_quantity <= 0 ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Out of stock
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600">
                          {product.stock_quantity} units available
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-gray-800">
                      {formatPrice(Number(product.price))}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDeactivate(product.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Deactivate listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
