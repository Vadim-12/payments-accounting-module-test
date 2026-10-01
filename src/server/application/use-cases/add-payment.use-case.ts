import { summarizePayments } from '@/domain/accounting';
import { PaymentAlreadyExistsError } from '@/server/application/errors/payment-already-exists.error';
import type { PaymentCommand, RecordPaymentResult } from '@/server/domain/accounting.types';
import type { PaymentAccountingRepository } from '@/server/application/ports/payment-accounting.repository';

export class OrderNotFoundError extends Error {}

export class AddPaymentUseCase {
  constructor(private readonly repository: PaymentAccountingRepository) {}

  async execute(command: PaymentCommand): Promise<RecordPaymentResult> {
    try {
      return await this.repository.withinTransaction(async (transaction) => {
        const order = await transaction.getOrderForUpdate(command.orderId);
        if (!order) throw new OrderNotFoundError('Заказ не найден');

        const duplicate = await transaction.findPaymentByExternalId(command.externalId);
        if (duplicate) return { duplicated: true, paymentId: duplicate.id };

        const payment = await transaction.createPayment(command);

        const payments = await transaction.getPaymentsForOrder(order.id);
        const summary = summarizePayments(order.totalAmount, payments);

        await transaction.updateOrderStatus(order.id, summary.status);

        return { duplicated: false, paymentId: payment.id, summary };
      });
    } catch (error) {
      if (!(error instanceof PaymentAlreadyExistsError)) throw error;

      const duplicate = await this.repository.findExistingPayment(command.externalId);
      if (!duplicate) throw error;

      return { duplicated: true, paymentId: duplicate.id };
    }
  }
}
