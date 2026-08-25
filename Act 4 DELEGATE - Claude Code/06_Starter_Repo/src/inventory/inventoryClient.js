async function checkAvailability(sku, quantity) {
  return Boolean(sku && quantity > 0);
}
module.exports = { checkAvailability };
