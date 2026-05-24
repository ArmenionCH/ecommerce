-- Run in Supabase SQL Editor if demo logins fail or signup returns "Database error".
-- 1) Makes profile trigger idempotent
-- 2) Adds auth.identities rows required for email/password login

CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DO $$
DECLARE
    v_instance_id UUID;
BEGIN
    SELECT id INTO v_instance_id FROM auth.instances LIMIT 1;
    IF v_instance_id IS NULL THEN
        v_instance_id := '00000000-0000-0000-0000-000000000000';
    END IF;

    INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    )
    VALUES
        (
            '00000000-0000-0000-0000-000000000011',
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001',
            '{"sub": "00000000-0000-0000-0000-000000000001", "email": "admin@greenmarket.com"}'::jsonb,
            'email',
            NOW(), NOW(), NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000012',
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000002',
            '{"sub": "00000000-0000-0000-0000-000000000002", "email": "seller@greenmarket.com"}'::jsonb,
            'email',
            NOW(), NOW(), NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000013',
            '00000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000003',
            '{"sub": "00000000-0000-0000-0000-000000000003", "email": "customer@greenmarket.com"}'::jsonb,
            'email',
            NOW(), NOW(), NOW()
        )
    ON CONFLICT (provider_id, provider) DO NOTHING;
END $$;
