'use client';

import { useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { baseFeed } from '../utils/baseFeed';
import { textSimilarity } from '../utils/textSimilarity';
import type { Product, ProductVariation } from '@/lib/types';

export function useProductLoader() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const feed = await baseFeed(limit);
      setProducts(feed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product feed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (queryText: string) => {
    if (!queryText.trim()) {
      await loadFeed();
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Try to use textSimilarity (Phase 2 stub)
      const similarityResults = await textSimilarity(queryText);
      if (similarityResults && similarityResults.length > 0) {
        setProducts(similarityResults);
        return;
      }

      // Fallback: simple case-insensitive substring match
      const { data, error: fetchErr } = await supabaseClient
        .from('products')
        .select('*')
        .eq('is_active', true)
        .ilike('title', `%${queryText}%`);

      if (fetchErr) throw fetchErr;
      setProducts((data as Product[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setIsLoading(false);
    }
  }, [loadFeed]);

  const loadProductWithVariations = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: product, error: prodErr } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (prodErr) throw prodErr;

      const { data: variations, error: varErr } = await supabaseClient
        .from('product_variations')
        .select('*')
        .eq('product_id', id);

      if (varErr) throw varErr;

      return {
        product: product as Product,
        variations: (variations as ProductVariation[]) ?? [],
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product detail.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    isLoading,
    error,
    loadFeed,
    searchProducts,
    loadProductWithVariations,
  };
}
