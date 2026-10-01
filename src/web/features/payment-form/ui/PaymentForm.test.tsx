import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentForm } from '@/web/features/payment-form/ui/PaymentForm';

const api = vi.hoisted(() => ({ addPayment: vi.fn() }));

vi.mock('@/web/features/payment-form/api/useAddPaymentMutation', () => ({
  useAddPaymentMutation: () => ({ isPending: false, mutateAsync: api.addPayment }),
}));

const order = {
  id: 'order-1',
  number: 'ORD-001',
  totalAmount: 12_500,
  status: 'unpaid' as const,
  payments: [],
  paid: 0,
  balance: 12_500,
};

describe('PaymentForm', () => {
  afterEach(cleanup);

  beforeEach(() => vi.resetAllMocks());

  it('does not send a zero-value payment', async () => {
    render(<PaymentForm orders={[order]} selectedOrderId={order.id} />);

    fireEvent.change(screen.getByLabelText('Сумма, ₽'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Внешний ID платежа'), {
      target: { value: 'payment-1' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Зачислить платёж' }).closest('form')!);

    expect((await screen.findByRole('alert')).textContent).toBe('Введите корректную сумму.');
    expect(api.addPayment).not.toHaveBeenCalled();
  });

  it('submits an amount in minor currency units', async () => {
    api.addPayment.mockResolvedValue({ duplicated: false, paymentId: 'payment-1' });
    render(<PaymentForm orders={[order]} selectedOrderId={order.id} />);

    fireEvent.change(screen.getByLabelText('Сумма, ₽'), { target: { value: '1500.25' } });
    fireEvent.change(screen.getByLabelText('Внешний ID платежа'), {
      target: { value: 'gateway-1' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Зачислить платёж' }).closest('form')!);

    await waitFor(() =>
      expect(api.addPayment).toHaveBeenCalledWith({
        orderId: 'order-1',
        amount: 150_025,
        externalId: 'gateway-1',
      }),
    );
    expect(screen.getByText('Платёж добавлен.')).toBeTruthy();
  });

  it('shows an idempotency message for a duplicate payment', async () => {
    api.addPayment.mockResolvedValue({ duplicated: true, paymentId: 'payment-1' });
    render(<PaymentForm orders={[order]} selectedOrderId={order.id} />);

    fireEvent.change(screen.getByLabelText('Сумма, ₽'), { target: { value: '1500' } });
    fireEvent.change(screen.getByLabelText('Внешний ID платежа'), {
      target: { value: 'gateway-1' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Зачислить платёж' }).closest('form')!);

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Платёж с таким внешним ID уже был обработан.',
    );
  });
});
