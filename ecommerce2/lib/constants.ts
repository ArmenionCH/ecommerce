/** Platform-wide immutable constants. Never hardcode these inline. */

export const SHIPPING_FEE = 100.00 as const; // ₱100.00 flat, COD mandate

export const USER_ROLES = {
  CUSTOMER : 'customer',
  SELLER   : 'seller',
  ADMIN    : 'admin',
} as const;

export const ORDER_STATUSES = {
  PLACED     : 'placed',
  PACKED     : 'packed',
  TO_RECEIVE : 'to_receive',
  RECEIVED   : 'received',
  CANCELLED  : 'cancelled',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed     : 'Order Placed',
  packed     : 'On The Way',
  to_receive : 'On The Way',
  received   : 'Delivered',
  cancelled  : 'Cancelled',
};
