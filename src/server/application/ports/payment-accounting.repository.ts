import type { OrderStatus, PaymentInput } from '@/server/domain/accounting';

import type { OrderWithPayments, PaymentCommand } from '@/server/domain/accounting.types';

export interface PaymentTransaction {
  getOrderForUpdate(orderId: string): Promise<{ id: string; totalAmount: number } | undefined>;
  findPaymentByExternalId(externalId: string): Promise<{ id: string } | undefined>;
  createPayment(payment: PaymentCommand): Promise<{ id: string }>;
  getPaymentsForOrder(orderId: string): Promise<PaymentInput[]>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
}

export interface PaymentAccountingRepository {
  listOrdersWithPayments(): Promise<OrderWithPayments[]>;
  findExistingPayment(externalId: string): Promise<{ id: string } | undefined>;
  withinTransaction<T>(callback: (transaction: PaymentTransaction) => Promise<T>): Promise<T>;
}
