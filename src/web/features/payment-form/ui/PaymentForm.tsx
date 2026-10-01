import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import styles from './PaymentForm.module.scss';
import type { Order } from '@/web/entities/order/model/types';
import { useAddPaymentMutation } from '@/web/features/payment-form/api/useAddPaymentMutation';
import { formatCurrencyAmount, isMoneyInput, toMinorUnits } from '@/web/shared/lib/currency';
import cardStyles from '@/web/shared/ui/AppCard.module.scss';

interface PaymentFormProps {
  orders: Order[];
  selectedOrderId: string;
}

type FormNotice = {
  message: string;
  type: 'error' | 'success';
};

export function PaymentForm({ orders, selectedOrderId }: PaymentFormProps) {
  const [orderId, setOrderId] = useState(selectedOrderId);
  const [amount, setAmount] = useState('');
  const [externalId, setExternalId] = useState('');
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const addPayment = useAddPaymentMutation();

  useEffect(() => {
    if (!orderId && selectedOrderId) {
      setOrderId(selectedOrderId);
    }
  }, [orderId, selectedOrderId]);

  async function submit(event: FormEvent) {
    event.preventDefault();

    const amountInMinorUnits = toMinorUnits(amount);
    if (!orderId || !isMoneyInput(amount) || amountInMinorUnits <= 0) {
      setNotice({ type: 'error', message: 'Введите корректную сумму.' });
      return;
    }

    try {
      const result = await addPayment.mutateAsync({
        orderId,
        amount: amountInMinorUnits,
        externalId,
      });

      setNotice({
        type: result.duplicated ? 'error' : 'success',
        message: result.duplicated
          ? 'Платёж с таким внешним ID уже был обработан.'
          : 'Платёж добавлен.',
      });

      if (!result.duplicated) {
        setAmount('');
        setExternalId('');
      }
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Не удалось добавить платёж.',
      });
    }
  }

  return (
    <form className={`${cardStyles.appCard} ${styles.paymentPanel}`} onSubmit={submit}>
      <h2 className="mb-4 text-xl font-bold">Добавить платёж</h2>
      <label className="mb-4 grid gap-2 text-sm font-semibold">
        Заказ
        <select
          className={styles.formControl}
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
        >
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.number} — {formatCurrencyAmount(order.totalAmount)}
            </option>
          ))}
        </select>
      </label>
      <label className="mb-4 grid gap-2 text-sm font-semibold">
        Сумма, ₽
        <input
          className={styles.formControl}
          type="number"
          value={amount}
          onChange={(event) => {
            const value = event.target.value;
            if (value === '' || /^\d*(?:\.\d{0,2})?$/.test(value)) {
              setAmount(value);
            }
          }}
          onKeyDown={(event) => {
            if (['e', 'E', '+', '-'].includes(event.key)) {
              event.preventDefault();
            }
          }}
          placeholder="1500.00"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          required
        />
      </label>
      <label className="mb-4 grid gap-2 text-sm font-semibold">
        Внешний ID платежа
        <input
          className={styles.formControl}
          value={externalId}
          onChange={(event) => setExternalId(event.target.value)}
          placeholder="payment_001"
          minLength={3}
          required
        />
      </label>
      <button className={styles.primaryButton} disabled={addPayment.isPending} type="submit">
        {addPayment.isPending ? 'Зачисление…' : 'Зачислить платёж'}
      </button>
      {notice && (
        <p
          className={`${styles.formNotice} ${styles[notice.type]}`}
          role={notice.type === 'error' ? 'alert' : 'status'}
        >
          {notice.message}
        </p>
      )}
    </form>
  );
}
