import { formatCurrencyAmount } from '@/web/shared/lib/currency';
import styles from './ReportSummary.module.scss';
import cardStyles from '@/web/shared/ui/AppCard.module.scss';

type Totals = { total: number; paid: number; balance: number };

export function ReportSummary({ totals }: { totals: Totals }) {
  return (
    <section className="my-8 grid gap-4 sm:grid-cols-3">
      <div className={`${cardStyles.appCard} ${styles.metricCard}`}>
        <span className="block text-sm text-slate-500">К оплате</span>
        <strong className="mt-1 block text-2xl">{formatCurrencyAmount(totals.total)}</strong>
      </div>
      <div className={`${cardStyles.appCard} ${styles.metricCard}`}>
        <span className="block text-sm text-slate-500">Оплачено</span>
        <strong className="mt-1 block text-2xl">{formatCurrencyAmount(totals.paid)}</strong>
      </div>
      <div className={`${cardStyles.appCard} ${styles.metricCard}`}>
        <span className="block text-sm text-slate-500">Остаток</span>
        <strong className="mt-1 block text-2xl">{formatCurrencyAmount(totals.balance)}</strong>
      </div>
    </section>
  );
}
