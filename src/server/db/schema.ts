import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const orderStatus = pgEnum('order_status', ['unpaid', 'partially_paid', 'paid', 'overpaid']);

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  number: text('number').notNull().unique(),
  totalAmount: integer('total_amount').notNull(),
  status: orderStatus('status').notNull().default('unpaid'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    externalId: text('external_id').notNull(),
    amount: integer('amount').notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('payments_external_id_unique').on(table.externalId),
    index('payments_order_id_index').on(table.orderId),
  ],
);
