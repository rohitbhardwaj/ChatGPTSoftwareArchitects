const orderRepository = require('../repositories/orderRepository');
const paymentGateway = require('../payment/paymentGateway');
const inventoryClient = require('../inventory/inventoryClient');

function calculatePricing(items, discountCode) {
  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  let subtotal = 0;
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) throw new Error('Invalid quantity');
    if (!item.price || item.price <= 0) throw new Error('Invalid price');
    subtotal += item.quantity * item.price;
  }

  let discount = 0;
  if (discountCode === 'SAVE10') discount = subtotal * 0.10;
  if (discountCode && discountCode !== 'SAVE10') throw new Error('Invalid discount code');

  return { subtotal, discount, total: subtotal - discount };
}

function safeLogOrder(input, pricing) {
  console.log('Creating order', {
    itemCount: input.items.length,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    total: pricing.total
  });
}

async function createOrder(orderInput) {
  const pricing = calculatePricing(orderInput.items, orderInput.discountCode);
  safeLogOrder(orderInput, pricing);

  for (const item of orderInput.items) {
    const available = await inventoryClient.checkAvailability(item.sku, item.quantity);
    if (!available) throw new Error(`Item ${item.sku} is unavailable`);
  }

  const payment = await paymentGateway.charge({ token: orderInput.paymentToken, amount: pricing.total });
  const saved = await orderRepository.save({
    customerEmail: orderInput.customerEmail,
    items: orderInput.items,
    ...pricing,
    paymentId: payment.id
  });

  return { id: saved.id, total: saved.total, status: 'CONFIRMED' };
}

module.exports = { createOrder, calculatePricing };
