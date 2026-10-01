import type { OrderStatus } from '@/web/entities/order/model/types';
import './StatusBadge.scss';

const statusName: Record<OrderStatus, string> = {
  unpaid: 'Не оплачен',
  partially_paid: 'Частично оплачен',
  paid: 'Оплачен',
  overpaid: 'Переплата',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge ${status}`}>{statusName[status]}</span>;
}
