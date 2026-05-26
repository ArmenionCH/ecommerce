/** All shared TypeScript interfaces. Import from here — never redeclare inline. */

export type UserRole    = 'customer' | 'seller' | 'admin';
export type OrderStatus = 'placed' | 'packed' | 'to_receive' | 'received' | 'cancelled';

export interface Profile {
  id              : string;
  full_name       : string;
  role            : UserRole;
  phone_number    : string | null;
  delivery_address: string | null;
  metadata        : Record<string, unknown>;
  created_at      : string;
}

export interface Product {
  id            : number;
  seller_id     : string;
  title         : string;
  description   : string | null;
  price         : number;
  stock_quantity: number;
  image_url     : string | null;
  is_active     : boolean;
  product_type  : string | null;
  created_at    : string;
  profiles?     : Pick<Profile, 'full_name'> | null;
}

export interface ProductVariation {
  id            : number;
  product_id    : number;
  name          : string;
  value         : string;
  price_modifier: number;
  stock_quantity: number;
}

export interface CartItem {
  id          : number;
  customer_id : string;
  product_id  : number;
  variation_id: number | null;
  quantity    : number;
  created_at  : string;
  product?    : Product;         // Join-expanded (optional)
  variation?  : ProductVariation; // Join-expanded (optional)
}

export interface Order {
  id              : number;
  customer_id     : string;
  total_amount    : number;
  status          : OrderStatus;
  shipping_address: string;
  created_at      : string;
  order_items?    : OrderItem[]; // Join-expanded (optional)
}

export interface OrderItem {
  id                : number;
  order_id          : number;
  product_id        : number;
  seller_id         : string;
  variation_details : string | null;
  quantity          : number;
  price_at_purchase : number;
}

export interface Review {
  id          : number;
  product_id  : number;
  customer_id : string;
  rating      : number;
  comment     : string | null;
  created_at  : string;
  profile?    : Pick<Profile, 'full_name'>; // Join-expanded (optional)
}

export interface SellerAnalytics {
  seller_id              : string;
  total_earnings         : number;
  total_orders_handled   : number;
  pending_orders_count   : number;
  completed_orders_count : number;
}

export interface ProductSalesReport {
  product_id     : number;
  title          : string;
  list_price     : number;
  stock_quantity : number;
  is_active      : boolean;
  units_sold     : number;
  revenue        : number;
  orders_count   : number;
}

/** Payload shape for order placement. Prices are NEVER trusted from this object. */
export interface OrderPlacementPayload {
  customerId      : string;
  shippingAddress : string;
  items           : Array<{
    product_id  : number;
    seller_id   : string;
    quantity    : number;
    variation_id: number | null;
  }>;
}

/** Result returned from executeOrderPlacement */
export interface OrderPlacementResult {
  success : boolean;
  orderId?: number;
  error?  : string;
}
