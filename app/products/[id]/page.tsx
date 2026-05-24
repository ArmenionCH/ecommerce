import React from 'react';
import { ProductDetailWrapper } from './ProductDetailWrapper';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const idNum = parseInt(resolvedParams.id, 10);

  return <ProductDetailWrapper productId={idNum} />;
}
