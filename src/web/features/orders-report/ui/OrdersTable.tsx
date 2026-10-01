import type { Order } from '@/web/entities/order/model/types';
import { StatusBadge } from '@/web/entities/order/ui/StatusBadge';
import { formatCurrencyAmount } from '@/web/shared/lib/currency';
import '@/web/shared/ui/AppCard.scss';

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="app-card overflow-x-auto">
      <h2 className="mb-4 text-xl font-bold">Заказы</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-slate-500">
            <th className="px-2 py-2 first:pl-0">Заказ</th>
            <th className="px-2 py-2">К оплате</th>
            <th className="px-2 py-2">Оплачено</th>
            <th className="px-2 py-2">Остаток</th>
            <th className="px-2 py-2 last:pr-0">Статус</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-slate-100 last:border-0">
              <td className="px-2 py-1 first:pl-0">{order.number}</td>
              <td className="px-2 py-1">{formatCurrencyAmount(order.totalAmount)}</td>
              <td className="px-2 py-1">{formatCurrencyAmount(order.paid)}</td>
              <td className="px-2 py-1">{formatCurrencyAmount(order.balance)}</td>
              <td className="px-2 py-1 last:pr-0">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
