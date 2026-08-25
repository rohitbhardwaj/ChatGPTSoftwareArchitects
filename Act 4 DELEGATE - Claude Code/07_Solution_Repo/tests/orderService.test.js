const assert = require('assert');
const orderService = require('../src/services/orderService');

(async function runTests() {
  const order = await orderService.createOrder({
    customerEmail: 'customer@example.com',
    paymentToken: 'tok_test_123',
    items: [{ sku: 'shoe-red-12', quantity: 1, price: 95 }],
    discountCode: 'SAVE10'
  });
  assert.strictEqual(order.status, 'CONFIRMED');
  assert.strictEqual(order.total, 85.5);

  assert.throws(() => orderService.calculatePricing([], null), /at least one item/);
  assert.throws(() => orderService.calculatePricing([{ sku: 'x', quantity: 0, price: 10 }], null), /Invalid quantity/);
  assert.throws(() => orderService.calculatePricing([{ sku: 'x', quantity: 1, price: 10 }], 'BAD'), /Invalid discount code/);

  console.log('solution tests passed');
})();
