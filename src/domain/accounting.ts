export type OrderStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';

export type PaymentInput = {
  id: string;
  amount: number;
};

export type PaymentSummary = {
  paid: number;
  balance: number;
  status: OrderStatus;
};

export function summarizePayments(totalAmount: number, payments: PaymentInput[]): PaymentSummary {
  if (!Number.isInteger(totalAmount) || totalAmount <= 0) {
    throw new Error('Order total must be a positive integer amount in minor currency units');
  }

  const paid = payments.reduce((sum, payment) => {
    if (!Number.isInteger(payment.amount) || payment.amount <= 0) {
      throw new Error('Payment amount must be a positive integer amount in minor currency units');
    }
    return sum + payment.amount;
  }, 0);

  const balance = totalAmount - paid;
  const status: OrderStatus =
    paid === 0
      ? 'unpaid'
      : paid < totalAmount
        ? 'partially_paid'
        : paid === totalAmount
          ? 'paid'
          : 'overpaid';

  return { paid, balance, status };
}
