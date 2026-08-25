const assert = require('assert');
const orderService = require('../src/services/orderService');

(async function testCreateOrderHappyPath() {
  const order = await orderService.createOrder({
    customerEmail: 'customer@example.com',
    paymentToken: 'tok_test_123',
    items: [{ sku: 'shoe-red-12', quantity: 1, price: 95 }],
    subtotal: 95,
    discount: 0,
    total: 95
  });
  assert.strictEqual(order.status, 'CONFIRMED');
  assert.ok(order.id);
  console.log('starter tests passed');
})();
