// Intentional drift: Redis is being used as source of truth
class OrderService {
  constructor(db, redisClient) {
    this.db = db;
    this.redisClient = redisClient;
  }

  async updateOrderStatus(orderId, status) {
    await this.redisClient.set(`order:${orderId}:status`, status); // DRIFT: authoritative write to Redis
    return { orderId, status };
  }

  async recoverOrder(orderId) {
    const status = await this.redisClient.get(`order:${orderId}:status`); // DRIFT: Redis treated as truth
    return { orderId, status };
  }
}
module.exports = OrderService;
