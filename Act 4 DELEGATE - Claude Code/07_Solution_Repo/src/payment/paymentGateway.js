async function charge({ token, amount }) {
  if (!token) throw new Error('Missing payment token');
  if (amount <= 0) throw new Error('Invalid payment amount');
  return { id: `pay_${Date.now()}`, status: 'CAPTURED' };
}
module.exports = { charge };
