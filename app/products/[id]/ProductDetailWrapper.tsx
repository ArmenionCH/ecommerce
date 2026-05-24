'use client';

import React, { useEffect, useState } from 'react';
import { useProductLoader } from '@/features/products/hooks/useProductLoader';
import { ProductDetailView } from '@/features/products/components/ProductDetailView';
import type { Product, ProductVariation } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductDetailWrapperProps {
  productId: number;
}

export function ProductDetailWrapper({ productId }: ProductDetailWrapperProps) {
  const { loadProductWithVariations, error } = useProductLoader();
  const [data, setData] = useState<{ product: Product; variations: ProductVariation[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const res = await loadProductWithVariations(productId);
      if (res) {
        setData(res);
      }
      setLoading(false);
    }
    init();
  }, [productId, loadProductWithVariations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto my-10 space-y-4">
        <span className="text-5xl">⚠️</span>
        <h3 className="text-xl font-bold text-gray-800">Harvest Details Not Found</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          We could not load details for this produce. It may have been deactivated by the farmer or system admin.
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

  return <ProductDetailView product={data.product} variations={data.variations} />;
}
