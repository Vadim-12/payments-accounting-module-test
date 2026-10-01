import type { OrderView } from '@/server/domain/accounting.types';
import { ListOrdersUseCase } from '@/server/application/use-cases/list-orders.use-case';

export class GetPaymentReportUseCase {
  constructor(private readonly listOrders: ListOrdersUseCase) {}

  async execute() {
    const items = await this.listOrders.execute();
    return { items, totals: this.calculateTotals(items) };
  }

  private calculateTotals(items: OrderView[]) {
    return items.reduce(
      (sum, item) => ({
        totalAmount: sum.totalAmount + item.totalAmount,
        paid: sum.paid + item.paid,
        balance: sum.balance + item.balance,
      }),
      { totalAmount: 0, paid: 0, balance: 0 },
    );
  }
}
