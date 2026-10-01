import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '@/web/pages/dashboard/DashboardPage';

const api = vi.hoisted(() => ({ useOrdersQuery: vi.fn(), mutateAsync: vi.fn() }));

vi.mock('@/web/entities/order/api/useOrdersQuery', () => ({
  useOrdersQuery: api.useOrdersQuery,
}));

vi.mock('@/web/features/payment-form/api/useAddPaymentMutation', () => ({
  useAddPaymentMutation: () => ({ isPending: false, mutateAsync: api.mutateAsync }),
}));

describe('DashboardPage', () => {
  afterEach(cleanup);

  beforeEach(() => vi.resetAllMocks());

  it('renders order data and calculated totals', async () => {
    api.useOrdersQuery.mockReturnValue({
      data: [
        {
          id: 'order-1',
          number: 'ORD-001',
          totalAmount: 12_500,
          status: 'paid',
          payments: [],
          paid: 12_500,
          balance: 0,
        },
      ],
      isError: false,
      isPending: false,
    });
    render(<DashboardPage />);

    expect(await screen.findByText('ORD-001')).toBeTruthy();
    expect(screen.getAllByText(/125,00/)).not.toHaveLength(0);
    expect(screen.getByText('Оплачен')).toBeTruthy();
  });

  it('shows a recoverable error when the API is unavailable', async () => {
    api.useOrdersQuery.mockReturnValue({ data: undefined, isError: true, isPending: false });
    render(<DashboardPage />);

    expect(
      await screen.findByText('Не удалось загрузить заказы. Проверьте, что API запущен.'),
    ).toBeTruthy();
  });
});
