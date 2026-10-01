import { asc, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { PaymentInput } from '@/domain/accounting';
import { PaymentAlreadyExistsError } from '@/server/application/errors/payment-already-exists.error';
import type {
  PaymentAccountingRepository,
  PaymentTransaction,
} from '@/server/application/ports/payment-accounting.repository';
import type { OrderWithPayments, PaymentCommand } from '@/server/domain/accounting.types';
import { db } from '@/server/db/client';
import { orders, payments } from '@/server/db/schema';

type Database = NodePgDatabase<typeof import('@/server/db/schema')>;

export class PostgresPaymentAccountingRepository implements PaymentAccountingRepository {
  constructor(private readonly database: Database = db) {}

  async listOrdersWithPayments(): Promise<OrderWithPayments[]> {
    const rows = await this.database
      .select({
        id: orders.id,
        number: orders.number,
        totalAmount: orders.totalAmount,
        status: orders.status,
        paymentId: payments.id,
        paymentAmount: payments.amount,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .orderBy(asc(orders.number));

    const result = new Map<string, OrderWithPayments>();
    for (const row of rows) {
      const order = result.get(row.id) ?? {
        id: row.id,
        number: row.number,
        totalAmount: row.totalAmount,
        status: row.status,
        payments: [],
      };
      if (row.paymentId && row.paymentAmount !== null) {
        order.payments.push({ id: row.paymentId, amount: row.paymentAmount });
      }
      result.set(row.id, order);
    }

    return [...result.values()];
  }

  async findExistingPayment(externalId: string) {
    return this.database.query.payments.findFirst({
      columns: { id: true },
      where: eq(payments.externalId, externalId),
    });
  }

  async withinTransaction<T>(
    callback: (transaction: PaymentTransaction) => Promise<T>,
  ): Promise<T> {
    return this.database.transaction((transaction) =>
      callback(new PostgresPaymentTransaction(transaction)),
    );
  }
}

class PostgresPaymentTransaction implements PaymentTransaction {
  constructor(private readonly transaction: Database) {}

  async getOrderForUpdate(orderId: string) {
    const query = await this.transaction.execute(
      sql`select id, total_amount from orders where id = ${orderId} for update`,
    );
    const row = query.rows[0] as { id: string; total_amount: number } | undefined;

    return row && { id: row.id, totalAmount: row.total_amount };
  }

  async findPaymentByExternalId(externalId: string) {
    return this.transaction.query.payments.findFirst({
      where: eq(payments.externalId, externalId),
    });
  }

  async createPayment(payment: PaymentCommand) {
    try {
      const [created] = await this.transaction
        .insert(payments)
        .values(payment)
        .returning({ id: payments.id });
      return created;
    } catch (error) {
      if (isDuplicateExternalPaymentId(error)) throw new PaymentAlreadyExistsError();

      throw error;
    }
  }

  async getPaymentsForOrder(orderId: string): Promise<PaymentInput[]> {
    return this.transaction
      .select({ id: payments.id, amount: payments.amount })
      .from(payments)
      .where(eq(payments.orderId, orderId));
  }

  async updateOrderStatus(orderId: string, status: OrderWithPayments['status']) {
    await this.transaction
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }
}

function isDuplicateExternalPaymentId(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const databaseError = error as { code?: string; constraint?: string };
  return (
    databaseError.code === '23505' && databaseError.constraint === 'payments_external_id_unique'
  );
}
