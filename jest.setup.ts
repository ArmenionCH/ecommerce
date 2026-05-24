// jest.setup.ts

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://ouvhibueclfwcbibwwgi.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

// Mock Supabase JS client
jest.mock('@supabase/supabase-js', () => {
  class SupabaseMockBuilder {
    private tableName: string;
    private isInsert: boolean = false;
    private hasNegativeQuantity: boolean = false;

    constructor(tableName: string) {
      this.tableName = tableName;
    }

    select() { return this; }
    insert(payload: any) {
      this.isInsert = true;
      if (payload) {
        const items = Array.isArray(payload) ? payload : [payload];
        for (const item of items) {
          if (item.quantity < 0 || item.quantity === -1) {
            this.hasNegativeQuantity = true;
          }
        }
      }
      return this;
    }
    update() { return this; }
    delete() { return this; }
    eq() { return this; }
    neq() { return this; }
    in() { return this; }
    order() { return this; }
    limit() { return this; }

    async single() {
      if (this.tableName === 'orders') {
        return { data: { id: 101 }, error: null };
      }
      if (this.tableName === 'products') {
        return { data: { id: 1, price: 180.00, title: 'Batuan', seller_id: '00000000-0000-0000-0000-000000000002' }, error: null };
      }
      return { data: { id: 1 }, error: null };
    }

    async maybeSingle() {
      return { data: null, error: null };
    }

    // Thenable implementation to mimic the promise-like behavior of Supabase query builders
    then(onFulfilled: any) {
      let result: { data: any; error: any } = { data: [], error: null };

      if (this.tableName === 'products') {
        result = {
          data: [{ id: 1, price: 180.00, title: 'Batuan', seller_id: '00000000-0000-0000-0000-000000000002' }],
          error: null,
        };
      } else if (this.tableName === 'reviews' && this.isInsert) {
        result = { data: null, error: new Error('RLS policy violation') };
      } else if (this.tableName === 'cart_items') {
        if (this.isInsert && this.hasNegativeQuantity) {
          result = { data: null, error: new Error('Quantity must be positive') };
        } else {
          result = { data: [], error: null };
        }
      } else if (this.tableName === 'profiles') {
        result = { data: [{ full_name: 'Test Profile' }], error: null };
      }

      return Promise.resolve(result).then(onFulfilled);
    }
  }

  return {
    createClient: jest.fn(() => ({
      from: jest.fn((tableName) => new SupabaseMockBuilder(tableName)),
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-id' } }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-id' } }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
    })),
  };
});
