'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Leaf, ShoppingBag, ShieldAlert, DollarSign, Wallet } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface SystemOverviewCardProps {
  stats: {
    totalSales: number;
    totalSellers: number;
    totalProducts: number;
    totalCustomers: number;
    platformRevenue: number;
    pendingPayouts: number;
  };
}

export function SystemOverviewCard({ stats }: SystemOverviewCardProps) {
  const cards = [
    {
      title: 'Platform Gross Revenue',
      value: formatPrice(stats.totalSales),
      icon: ShoppingBag,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Platform Fees',
      value: formatPrice(stats.platformRevenue),
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Pending Payouts',
      value: formatPrice(stats.pendingPayouts),
      icon: Wallet,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Total Active Sellers',
      value: stats.totalSellers,
      icon: Leaf,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Active Listings',
      value: stats.totalProducts,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Registered Customers',
      value: stats.totalCustomers,
      icon: ShieldAlert,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 animate-in fade-in-50 duration-200">
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
