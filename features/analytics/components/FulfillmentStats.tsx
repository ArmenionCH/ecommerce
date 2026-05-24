'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { SellerAnalytics } from '@/lib/types';

interface FulfillmentStatsProps {
  metrics: SellerAnalytics | null;
}

export function FulfillmentStats({ metrics }: FulfillmentStatsProps) {
  const cards = [
    {
      title: 'Total Earnings',
      value: formatPrice(metrics ? Number(metrics.total_earnings) : 0),
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Orders Handled',
      value: metrics ? metrics.total_orders_handled : 0,
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Pending Fulfillment',
      value: metrics ? metrics.pending_orders_count : 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Completed Deliveries',
      value: metrics ? metrics.completed_orders_count : 0,
      icon: CheckCircle,
      color: 'bg-teal-50 text-teal-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in-50 duration-200">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title} className="border border-gray-100 bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  {card.title}
                </span>
                <span className="text-2xl font-black text-gray-800 block">
                  {card.value}
                </span>
              </div>
              <div className={`p-3 rounded-2xl ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
