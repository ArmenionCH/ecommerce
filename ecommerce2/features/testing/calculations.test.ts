// features/testing/calculations.test.ts
import { SHIPPING_FEE } from '../../lib/constants';

describe('Order Calculation Unit Tests', () => {

  test('SHIPPING_FEE constant is always ₱100.00', () => {
    expect(SHIPPING_FEE).toBe(100.00);
  });

  test('Grand total = subtotal + ₱100 shipping', () => {
    const subtotal   = 500.00;
    const grandTotal = subtotal + SHIPPING_FEE;
    expect(grandTotal).toBe(600.00);
  });

  test('Multi-item subtotal is sum of (price * qty) per item', () => {
    const items = [
      { price: 180.00, quantity: 2 },
      { price: 330.00, quantity: 1 },
    ];
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    expect(subtotal).toBe(690.00);
  });

});
