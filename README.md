# Green Market 🥬

Green Market is a production-grade, multi-vendor agricultural e-commerce platform built using **Next.js 16 (App Router)**, **TypeScript**, **Supabase (PostgreSQL + RLS)**, and **Tailwind CSS v4**. It implements strict security constraints for Cash on Delivery (COD) operations, flat shipping fees, and database-enforced warehouse inventory protections.

---

## 🚀 Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + React 19)
- **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Database Triggers, Realtime subscriptions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI primitives](https://www.radix-ui.com/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 🛠️ Getting Started

### 1. Prerequisites
Ensure you have **Node.js 20+** and **npm** installed:
```bash
node --version
npm --version
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Schema Setup
Execute the SQL statements inside [schema.sql](file:///c:/Users/USER/Desktop/antigravity/schema.sql) in your **Supabase SQL Editor** to initialize the database:
1. Extensions & Enums
2. Database Tables (Profiles, Products, Variations, Cart Items, Orders, Order Items, Reviews)
3. DB Triggers (`check_cart_stock_limits`, `deduct_product_stock`, `handle_new_user_registration`)
4. Seller Analytics view and Performance indexes
5. Row Level Security (RLS) policies and `auth.get_user_role()` function
6. Seeding mocks (Admin, Seller, Customer, Product, Variations)

### 4. Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Running the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the marketplace.

---

## 🧪 Running Tests

We use Jest for unit and integration testing:
```bash
npm run test
```
The test suite validates:
- **Calculations**: Flat shipping rate checks (₱100.00) and order subtotal assertions.
- **RLS isolation**: Ensures buyers cannot intercept other customers' active carts or write unverified product reviews.
- **Trigger integrations**: Clamping checkout stock allocations and deducting warehouse limits upon purchase completion.

---

## 🛡️ Business Rules & Security

1. **COD Mandate**: cash collection route is generated for every order. Digital payments and escrow methods are strictly disabled.
2. **Flat Shipping**: Shipping fee is strictly **₱100.00**, calculated server-side in `calculations.ts` to prevent client payloads interception.
3. **Anti-Deficit Stock Lock**: PostgreSQL trigger `tr_enforce_cart_stock` clamps cart writes based on physical warehouse availability.
4. **Soft Delete**: Hard deletes on products and profiles are prohibited (`is_active = false` flag is updated instead to preserve audit logs history).
5. **Anti Price-Manipulation**: Checkout engine re-fetches prices from database tables using product IDs instead of trusting client-side payload prices.

---

## 👥 Development Group
- **Carlo** (Platform Security & System Admin)
- **Bonda** (Database & Auth Hooks)
- **Perez** (Core Infrastructure & Types)
- **Ascado** (Cart features & Dialogs)
- **Baquirel** (Analytics & Charts)
- **Rosal** (App Routes & Pages Wiring)
