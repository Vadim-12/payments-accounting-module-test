import type { OrderStatus, PaymentInput } from '@/server/domain/accounting';

export type OrderWithPayments = {
  id: string;
  number: string;
  totalAmount: number;
  status: OrderStatus;
  payments: PaymentInput[];
};

export type OrderView = OrderWithPayments & {
  paid: number;
  balance: number;
};

export type PaymentCommand = {
  orderId: string;
  externalId: string;
  amount: number;
  paidAt: Date;
};

export type RecordPaymentResult =
  | { duplicated: true; paymentId: string }
  | {
      duplicated: false;
      paymentId: string;
      summary: { paid: number; balance: number; status: OrderStatus };
    };
