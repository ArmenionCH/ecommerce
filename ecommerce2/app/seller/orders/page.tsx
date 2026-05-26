'use client';

import React from 'react';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { useSellerOrders } from '@/features/orders/hooks/useSellerOrders';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Package, Clock, AlertCircle } from 'lucide-react';

export default function SellerOrdersPage() {
  const { user, isLoading: isSessionLoading, hasAuthSession } = useUserSession();
  const sellerId = user && user.role === 'seller' ? user.id : null;
  const { orders, isLoading, unreadCount, approveOrder, rejectOrder } = useSellerOrders(sellerId);

  if (isSessionLoading || !hasAuthSession) {
    return <div className="p-8">Loading...</div>;
  }

  if (!sellerId) {
    return <div className="p-8 text-center text-gray-500">Access denied. Sellers only.</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'packed':
        return <Package className="w-5 h-5 text-emerald-500" />;
      case 'to_receive':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'received':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      placed: 'bg-amber-100 text-amber-700',
      packed: 'bg-emerald-100 text-emerald-700',
      to_receive: 'bg-blue-100 text-blue-700',
      received: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-rose-100 text-rose-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Orders</h1>
        <p className="text-gray-500 mt-2">
          Manage and fulfill incoming orders
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              {unreadCount} new order{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-500">Order #{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₱{order.total_amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                <div className="space-y-2">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Product ID: {item.product_id} × {item.quantity}
                      </span>
                      <span className="text-gray-900 font-medium">
                        ₱{(item.price_at_purchase * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Shipping Address:</p>
                <p className="text-sm text-gray-600">{order.shipping_address}</p>
              </div>

              {order.status === 'placed' && (
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={() => approveOrder(order.id, sellerId)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Order
                  </Button>
                  <Button
                    onClick={() => rejectOrder(order.id, sellerId)}
                    variant="outline"
                    className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Order
                  </Button>
                </div>
              )}

              {order.status === 'packed' && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order approved and packed. Waiting for customer confirmation.
                  </p>
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-rose-50 rounded-lg">
                  <p className="text-sm text-rose-700 font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Order rejected by seller.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
