let nextId = 1000;
async function save(order) {
  return { ...order, id: `ord_${nextId++}` };
}
module.exports = { save };
