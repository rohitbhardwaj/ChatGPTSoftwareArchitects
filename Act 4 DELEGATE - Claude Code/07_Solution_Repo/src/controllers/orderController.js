const orderService = require('../services/orderService');

async function createOrder(req, res) {
  try {
    const order = await orderService.createOrder(req.body || {});
    return res.status(201).json(order);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { createOrder };
