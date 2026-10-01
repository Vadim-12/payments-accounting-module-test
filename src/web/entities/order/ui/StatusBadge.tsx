import type { OrderStatus } from '@/web/entities/order/model/types';
import styles from './StatusBadge.module.scss';

const statusName: Record<OrderStatus, string> = {
  unpaid: 'Не оплачен',
  partially_paid: 'Частично оплачен',
  paid: 'Оплачен',
  overpaid: 'Переплата',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`${styles.statusBadge} ${styles[status]}`}>{statusName[status]}</span>;
}
