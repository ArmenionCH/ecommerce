'use client';

import React, { useEffect, useState } from 'react';
import { useProductLoader } from '@/features/products/hooks/useProductLoader';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { MarketplaceGate } from '@/features/auth/components/MarketplaceGate';

export default function MarketplaceHome() {
  const { products, isLoading, loadFeed, searchProducts } = useProductLoader();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
  };

  return (
    <MarketplaceGate>
    <div className="space-y-10">
      {/* Premium Hero Banner */}
      <div className="relative rounded-3xl bg-linear-to-r from-emerald-600 to-teal-500 text-white p-8 sm:p-12 overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            100% Cash On Delivery Marketplace
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Everything You Need. One Marketplace.
          </h1>
          <p className="text-sm sm:text-base text-emerald-50 max-w-lg font-medium leading-relaxed">
            Discover deals from trusted sellers — electronics, fashion, home essentials, and more. Order with COD and ₱100 flat shipping.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-5 border border-gray-100 rounded-2xl shadow-xs">
        <div className="w-full sm:max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products, brands, categories..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex gap-2 text-xs font-bold text-gray-500">
          <span className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-emerald-700 font-extrabold cursor-pointer">
            All products
          </span>
        </div>
      </div>

      {/* Marketplace Catalog Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recommended for you</h2>
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </div>
    </MarketplaceGate>
  );
}
