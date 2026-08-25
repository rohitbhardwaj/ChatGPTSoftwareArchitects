// Intentional drift: retry without idempotency
class PaymentService {
  constructor(provider) { this.provider = provider; }

  async charge(orderId, amount, cardToken) {
    let lastError;
    for (let i = 0; i < 3; i++) {
      try {
        return await this.provider.charge({ orderId, amount, cardToken }); // DRIFT: no idempotency key
      } catch (e) { lastError = e; }
    }
    throw lastError;
  }
}
module.exports = PaymentService;
