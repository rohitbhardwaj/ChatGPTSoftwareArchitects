const orderRepository = require('../repositories/orderRepository');
const paymentGateway = require('../payment/paymentGateway');
const inventoryClient = require('../inventory/inventoryClient');

async function createOrder(orderInput) {
  // Security smell: logs full order, including customerEmail and paymentToken.
  console.log('Creating order', orderInput);

  for (const item of orderInput.items) {
    const available = await inventoryClient.checkAvailability(item.sku, item.quantity);
    if (!available) {
      throw new Error(`Item ${item.sku} is unavailable`);
    }
  }

  const payment = await paymentGateway.charge({
    token: orderInput.paymentToken,
    amount: orderInput.total
  });

  const saved = await orderRepository.save({
    customerEmail: orderInput.customerEmail,
    items: orderInput.items,
    subtotal: orderInput.subtotal,
    discount: orderInput.discount,
    total: orderInput.total,
    paymentId: payment.id
  });

  return { id: saved.id, total: saved.total, status: 'CONFIRMED' };
}

module.exports = { createOrder };
