import { z } from 'zod';

const money = z.number().int().positive().max(100_000_000);

export const addPaymentInput = z.object({
  orderId: z.string().uuid(),
  externalId: z.string().trim().min(3).max(100),
  amount: money,
  paidAt: z.coerce.date().default(() => new Date()),
});
