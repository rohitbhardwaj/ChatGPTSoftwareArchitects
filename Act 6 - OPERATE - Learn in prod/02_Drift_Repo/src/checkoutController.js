// Intentional drift: controller contains domain pricing logic
async function checkout(req, res) {
  const cart = req.body.cart;
  let subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (cart.coupon === 'BLACKFRIDAY') {
    subtotal = subtotal * 0.70; // DRIFT: pricing rule in controller
  }
  console.log('checkout request', req.body.customerEmail, req.body.address); // DRIFT: PII in logs
  res.json({ total: subtotal });
}
module.exports = { checkout };
