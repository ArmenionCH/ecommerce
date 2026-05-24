'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

interface EarningsChartProps {
  data: Array<{ name: string; earnings: number }>;
}

export function EarningsChart({ data }: EarningsChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsMounted(true);
    });
  }, []);

  if (!isMounted) {
    return (
      <Card className="col-span-4 border border-gray-100 bg-white rounded-3xl">
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
          <CardDescription>Monthly revenue from completed orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-gray-50 animate-pulse rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4 border border-gray-100 bg-white rounded-3xl animate-in fade-in-50 duration-200">
      <CardHeader>
        <CardTitle>Earnings Overview</CardTitle>
        <CardDescription>Monthly revenue from completed orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₱${value}`}
              />
              <Tooltip
                formatter={(value: any) => [formatPrice(Number(value)), 'Earnings']}
                contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }}
              />
              <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
