import { db, pool } from '@/server/db/client';
import { orders, payments } from '@/server/db/schema';

const totals = [
  12_500, 8_900, 15_000, 22_400, 6_700, 19_900, 31_250, 7_800, 13_600, 24_000, 9_500, 18_200,
];

async function seed() {
  const existingOrder = await db.select({ id: orders.id }).from(orders).limit(1);

  if (existingOrder.length > 0) {
    console.log('Skipped seed: database already contains orders');
    return;
  }

  const created = await db
    .insert(orders)
    .values(
      totals.map((totalAmount, index) => ({
        number: `ORD-${String(index + 1).padStart(3, '0')}`,
        totalAmount: totalAmount * 100,
      })),
    )
    .returning();

  await db.insert(payments).values([
    { orderId: created[0].id, externalId: 'seed-001', amount: 12_500 * 100, paidAt: new Date() },
    { orderId: created[1].id, externalId: 'seed-002', amount: 3_000 * 100, paidAt: new Date() },
    { orderId: created[3].id, externalId: 'seed-003', amount: 25_000 * 100, paidAt: new Date() },
    { orderId: created[6].id, externalId: 'seed-004', amount: 10_000 * 100, paidAt: new Date() },
  ]);

  console.log(`Seeded ${created.length} orders`);
}

seed().finally(() => pool.end());
