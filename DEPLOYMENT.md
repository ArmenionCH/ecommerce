# Green Market Deployment Guide 🚀

This document outlines the step-by-step production checklist for deploying the Green Market platform to **Vercel** and configuring the **Supabase** backend.

---

## 📦 Supabase Production Checklist

1. **Schema Migration**:
   - Execute all SQL statements in [schema.sql](file:///c:/Users/USER/Desktop/antigravity/schema.sql) in the Supabase SQL Editor.
   - Verify that all 7 tables have Row Level Security (RLS) enabled.

2. **Role Helper Permissions**:
   - Ensure the security definer function `public.get_user_role()` exists in the `public` schema.
   - Run the execution grant command:
     ```sql
     GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon, authenticated, service_role;
     ```

3. **Database Triggers**:
   - Double check that `tr_enforce_cart_stock` is active on `public.cart_items` for stock clamping.
   - Double check that `tr_deduct_stock` is active on `public.order_items` for automatic inventory deduction.
   - Double check that `tr_on_auth_user_created` is active on `auth.users` for automatic profile generation.

4. **Realtime Subscriptions**:
   - Go to your Supabase Dashboard -> **Database** -> **Replication**.
   - Enable replication for the `orders` table. This allows the customer tracker page (`useOrderStatus` hook) to dynamically update statuses in real-time when updated by sellers or administrators.

---

## ⚡ Vercel Deployment Checklist

1. **Initialize GitHub Repository**:
   - Create a clean git repository, add your files, and commit:
     ```bash
     git init
     git add .
     git commit -m "feat: bootstrap green market v2.0"
     ```
   - Push to your remote GitHub/GitLab repository.

2. **Create Vercel Project**:
   - Sign in to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
   - Import your Green Market repository.

3. **Configure Environment Variables**:
   - Under the **Environment Variables** section, add:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your production Supabase project URL.
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your production Supabase anonymous client API key.

4. **Build & Deploy**:
   - Click **Deploy**. Vercel will build the Next.js application, optimize layouts, bundle client-side code, and host server actions serverless routes.

---

## 🛠️ Verification & Quality Checks

Before promoting your deployment to production, perform the following validation commands locally:

1. **TypeScript Type Verification**:
   Ensure strict types compile without errors:
   ```bash
   npx tsc --noEmit
   ```

2. **Lint Audits**:
   Ensure layout files adhere to standard Next.js code checks:
   ```bash
   npm run lint
   ```

3. **Execution of Test Suites**:
   Run calculations, security, and triggers integration test cases:
   ```bash
   npm run test
   ```
