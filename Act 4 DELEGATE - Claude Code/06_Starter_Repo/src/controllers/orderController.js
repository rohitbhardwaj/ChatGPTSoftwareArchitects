const orderService = require('../services/orderService');

async function createOrder(req, res) {
  const body = req.body || {};

  // Architecture smell: pricing and discount logic live in the controller.
  if (!body.items || body.items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  let subtotal = 0;
  for (const item of body.items) {
    if (!item.quantity || item.quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }
    if (!item.price || item.price <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }
    subtotal += item.quantity * item.price;
  }

  let discount = 0;
  if (body.discountCode === 'SAVE10') {
    discount = subtotal * 0.10;
  }

  const order = await orderService.createOrder({
    customerEmail: body.customerEmail,
    paymentToken: body.paymentToken,
    items: body.items,
    subtotal,
    discount,
    total: subtotal - discount
  });

  return res.status(201).json(order);
}

module.exports = { createOrder };
