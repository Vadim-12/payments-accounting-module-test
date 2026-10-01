import { describe, expect, it } from 'vitest';
import type {
  PaymentAccountingRepository,
  PaymentTransaction,
} from '@/server/application/ports/payment-accounting.repository';
import { PaymentAlreadyExistsError } from '@/server/application/errors/payment-already-exists.error';
import { AddPaymentUseCase } from '@/server/application/use-cases/add-payment.use-case';

describe('AddPaymentUseCase', () => {
  it('updates the order status after recording a payment in a transaction', async () => {
    const transaction = new FakeTransaction();
    const repository: PaymentAccountingRepository = {
      listOrdersWithPayments: async () => [],
      findExistingPayment: async () => undefined,
      withinTransaction: (callback) => callback(transaction),
    };

    const result = await new AddPaymentUseCase(repository).execute({
      orderId: 'order-1',
      externalId: 'gateway-123',
      amount: 10_000,
      paidAt: new Date(),
    });

    expect(result).toMatchObject({ duplicated: false, summary: { status: 'paid', balance: 0 } });
    expect(transaction.updatedStatus).toBe('paid');
  });

  it('returns the original payment without writing a duplicate', async () => {
    const transaction = new FakeTransaction({ id: 'existing-payment' });
    const repository: PaymentAccountingRepository = {
      listOrdersWithPayments: async () => [],
      findExistingPayment: async () => undefined,
      withinTransaction: (callback) => callback(transaction),
    };

    await expect(
      new AddPaymentUseCase(repository).execute({
        orderId: 'order-1',
        externalId: 'gateway-123',
        amount: 10_000,
        paidAt: new Date(),
      }),
    ).resolves.toEqual({ duplicated: true, paymentId: 'existing-payment' });
    expect(transaction.updatedStatus).toBeUndefined();
  });

  it('returns the existing payment when a concurrent insert hits the unique index', async () => {
    const repository: PaymentAccountingRepository = {
      listOrdersWithPayments: async () => [],
      findExistingPayment: async () => ({ id: 'concurrently-created-payment' }),
      withinTransaction: async () => {
        throw new PaymentAlreadyExistsError();
      },
    };

    await expect(
      new AddPaymentUseCase(repository).execute({
        orderId: 'order-1',
        externalId: 'gateway-123',
        amount: 10_000,
        paidAt: new Date(),
      }),
    ).resolves.toEqual({ duplicated: true, paymentId: 'concurrently-created-payment' });
  });
});

class FakeTransaction implements PaymentTransaction {
  private payments: Array<{ id: string; amount: number }> = [];
  updatedStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid' | undefined;

  constructor(private readonly duplicate?: { id: string }) {}

  async getOrderForUpdate() {
    return { id: 'order-1', totalAmount: 10_000 };
  }

  async findPaymentByExternalId() {
    return this.duplicate;
  }

  async createPayment(payment: { amount: number }) {
    const created = { id: 'payment-1', amount: payment.amount };
    this.payments.push(created);
    return created;
  }

  async getPaymentsForOrder() {
    return this.payments;
  }

  async updateOrderStatus(_orderId: string, status: NonNullable<FakeTransaction['updatedStatus']>) {
    this.updatedStatus = status;
  }
}
