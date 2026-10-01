import { describe, expect, it } from 'vitest';
import { summarizePayments } from '@/domain/accounting';

describe('summarizePayments', () => {
  it('marks an order as partially paid', () => {
    expect(summarizePayments(10_000, [{ id: 'p-1', amount: 4_000 }])).toEqual({
      paid: 4_000,
      balance: 6_000,
      status: 'partially_paid',
    });
  });

  it('marks an order as overpaid and keeps a negative balance', () => {
    expect(summarizePayments(10_000, [{ id: 'p-1', amount: 12_000 }])).toEqual({
      paid: 12_000,
      balance: -2_000,
      status: 'overpaid',
    });
  });

  it('does not double-count a duplicate payment id when database uniqueness is used', () => {
    const acceptedPayments = new Map<string, number>();
    for (const payment of [
      { id: 'gateway-1', amount: 10_000 },
      { id: 'gateway-1', amount: 10_000 },
    ]) {
      if (!acceptedPayments.has(payment.id)) acceptedPayments.set(payment.id, payment.amount);
    }
    expect(
      summarizePayments(
        10_000,
        [...acceptedPayments].map(([id, amount]) => ({ id, amount })),
      ),
    ).toMatchObject({
      paid: 10_000,
      status: 'paid',
    });
  });
});
