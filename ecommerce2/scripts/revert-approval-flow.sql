-- =====================================================================
-- REVERT APPROVAL FLOW - KEEP VERIFICATION FEATURE
-- =====================================================================
-- This script:
-- 1. Removes seller verification requirement from product visibility
-- 2. Keeps verification metadata for blue checkmark feature
-- 3. Removes pending verification status from new seller registration
-- =====================================================================

-- ── 1. UPDATE PRODUCTS RLS POLICY - REMOVE VERIFICATION REQUIREMENT ──
-- Allow all sellers' products to be visible (not just verified sellers)
DROP POLICY IF EXISTS "products_select_active_or_owner_or_admin" ON public.products;
CREATE POLICY "products_select_active_or_owner_or_admin" ON public.products FOR SELECT
USING (
  auth.uid() = seller_id
  OR public.is_admin()
  OR is_active = true
);

-- ── 2. UPDATE REGISTRATION TRIGGER - REMOVE PENDING VERIFICATION STATUS ──
-- Sellers no longer start with "pending" verification status
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, metadata)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer'),
        CASE
            WHEN COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer') = 'seller'
            THEN '{"is_verified": false}'::jsonb
            ELSE '{}'::jsonb
        END
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- ── 3. KEEP VERIFICATION FUNCTION FOR BLUE CHECKMARK FEATURE ──
-- The seller_is_verified() function is kept for displaying blue checkmarks
-- No changes needed - it will be used for UI display only

-- ── 4. UPDATE SELLER PROFILE METADATA (OPTIONAL) ──
-- If you want to reset existing sellers to unverified state:
UPDATE public.profiles
SET metadata = jsonb_set(
    metadata, 
    '{is_verified}', 
    'false'::jsonb
)
WHERE role = 'seller';

-- =====================================================================
-- SUMMARY OF CHANGES:
-- =====================================================================
-- ✓ Products from all sellers are now visible (no verification required)
-- ✓ Verification metadata kept for blue checkmark feature
-- ✓ Sellers can apply for verification (optional)
-- ✓ Admin can approve/reject verification requests
-- ✓ New sellers start with is_verified: false (no pending status)
-- =====================================================================
