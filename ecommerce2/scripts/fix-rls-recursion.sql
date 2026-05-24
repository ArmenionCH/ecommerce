-- Run in Supabase SQL Editor: fixes "infinite recursion detected in policy for relation orders"
-- and enables seller verification for marketplace visibility.

-- ── Security definer helpers (bypass RLS — no policy recursion) ─────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_owns_order(p_order_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id AND customer_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_sells_on_order(p_order_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.order_items
    WHERE order_id = p_order_id AND seller_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.seller_is_verified(p_seller_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT (metadata->>'is_verified')::boolean
      FROM public.profiles
      WHERE id = p_seller_id AND role = 'seller'
    ),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_owns_order(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_sells_on_order(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.seller_is_verified(uuid) TO anon, authenticated, service_role;

-- Replace get_user_role() to use is_admin pattern where possible
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ── Products: only verified sellers visible on marketplace ─────────────
DROP POLICY IF EXISTS "products_select_active_or_owner_or_admin" ON public.products;
CREATE POLICY "products_select_active_or_owner_or_admin" ON public.products
FOR SELECT USING (
  auth.uid() = seller_id
  OR public.is_admin()
  OR (
    is_active = true
    AND public.seller_is_verified(seller_id)
  )
);

-- ── Orders: break orders ↔ order_items recursion ───────────────────────
DROP POLICY IF EXISTS "orders_select_customer_or_seller_or_admin" ON public.orders;
CREATE POLICY "orders_select_customer_or_seller_or_admin" ON public.orders
FOR SELECT USING (
  auth.uid() = customer_id
  OR public.is_admin()
  OR public.user_sells_on_order(id)
);

DROP POLICY IF EXISTS "orders_insert_customer_only" ON public.orders;
CREATE POLICY "orders_insert_customer_only" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "orders_update_seller_or_admin" ON public.orders;
CREATE POLICY "orders_update_seller_or_admin" ON public.orders
FOR UPDATE USING (
  public.is_admin()
  OR public.user_sells_on_order(id)
);

-- ── Order items: no subquery back to orders table in RLS ───────────────
DROP POLICY IF EXISTS "order_items_select_related_parties" ON public.order_items;
CREATE POLICY "order_items_select_related_parties" ON public.order_items
FOR SELECT USING (
  seller_id = auth.uid()
  OR public.is_admin()
  OR public.user_owns_order(order_id)
);

DROP POLICY IF EXISTS "order_items_insert_system_only" ON public.order_items;
CREATE POLICY "order_items_insert_customer_on_own_order" ON public.order_items
FOR INSERT WITH CHECK (
  public.user_owns_order(order_id)
);
