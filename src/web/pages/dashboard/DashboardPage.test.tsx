import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '@/web/pages/dashboard/DashboardPage';

const api = vi.hoisted(() => ({ listOrders: vi.fn(), addPayment: vi.fn() }));

vi.mock('@/web/trpc', () => ({
  trpc: {
    orders: { list: { query: api.listOrders } },
    payments: { add: { mutate: api.addPayment } },
  },
}));

describe('DashboardPage', () => {
  afterEach(cleanup);

  beforeEach(() => vi.resetAllMocks());

  it('renders order data and calculated totals', async () => {
    api.listOrders.mockResolvedValue([
      {
        id: 'order-1',
        number: 'ORD-001',
        totalAmount: 12_500,
        status: 'paid',
        payments: [],
        paid: 12_500,
        balance: 0,
      },
    ]);
    render(<DashboardPage />);

    expect(await screen.findByText('ORD-001')).toBeTruthy();
    expect(screen.getAllByText(/125,00/)).not.toHaveLength(0);
    expect(screen.getByText('Оплачен')).toBeTruthy();
  });

  it('shows a recoverable error when the API is unavailable', async () => {
    api.listOrders.mockRejectedValue(new Error('Network error'));
    render(<DashboardPage />);

    expect(
      await screen.findByText('Не удалось загрузить заказы. Проверьте, что API запущен.'),
    ).toBeTruthy();
  });
});
