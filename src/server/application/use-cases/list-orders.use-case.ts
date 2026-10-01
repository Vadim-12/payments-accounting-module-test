import { summarizePayments } from '@/server/domain/accounting';
import type { OrderView } from '@/server/domain/accounting.types';
import type { PaymentAccountingRepository } from '@/server/application/ports/payment-accounting.repository';

export class ListOrdersUseCase {
  constructor(private readonly repository: PaymentAccountingRepository) {}

  async execute(): Promise<OrderView[]> {
    const orders = await this.repository.listOrdersWithPayments();

    return orders.map((order) => ({
      ...order,
      ...summarizePayments(order.totalAmount, order.payments),
    }));
  }
}
