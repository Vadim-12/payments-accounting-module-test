import { useMemo } from 'react';
import styles from './DashboardPage.module.scss';
import { useOrdersQuery } from '@/web/entities/order/api/useOrdersQuery';
import type { Order } from '@/web/entities/order/model/types';
import { PaymentForm } from '@/web/features/payment-form/ui/PaymentForm';
import { OrdersTable } from '@/web/features/orders-report/ui/OrdersTable';
import { ReportSummary } from '@/web/features/orders-report/ui/ReportSummary';

const emptyOrders: Order[] = [];

export function DashboardPage() {
  const ordersQuery = useOrdersQuery();
  const orders = ordersQuery.data ?? emptyOrders;

  const totals = useMemo(
    () =>
      orders.reduce(
        (sum, order) => ({
          total: sum.total + order.totalAmount,
          paid: sum.paid + order.paid,
          balance: sum.balance + order.balance,
        }),
        { total: 0, paid: 0, balance: 0 },
      ),
    [orders],
  );

  return (
    <main className={`${styles.dashboard} mx-auto max-w-6xl px-6 py-14`}>
      <header className={styles.dashboardHero}>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">
          Тестовое задание
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Учёт платежей</h1>
        <p className="mt-3 max-w-xl text-indigo-100">
          Заказы, статусы оплаты и итоговый отчёт — с безопасной обработкой дублей.
        </p>
      </header>
      {ordersQuery.isPending && <p className="mt-4 text-sm text-slate-500">Загрузка заказов…</p>}
      {ordersQuery.isError && (
        <p className="mt-4 rounded-xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-800">
          Не удалось загрузить заказы. Проверьте, что API запущен.
        </p>
      )}
      <ReportSummary totals={totals} />
      <section className="grid items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <OrdersTable orders={orders} />
        <PaymentForm orders={orders} selectedOrderId={orders[0]?.id ?? ''} />
      </section>
    </main>
  );
}
