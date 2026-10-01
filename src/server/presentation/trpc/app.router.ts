import { AddPaymentUseCase } from '@/server/application/use-cases/add-payment.use-case';
import { GetPaymentReportUseCase } from '@/server/application/use-cases/get-payment-report.use-case';
import { ListOrdersUseCase } from '@/server/application/use-cases/list-orders.use-case';
import { PostgresPaymentAccountingRepository } from '@/server/infrastructure/repositories/postgres-payment-accounting.repository';
import { createOrderRouter } from '@/server/presentation/trpc/order.router';
import { createPaymentRouter } from '@/server/presentation/trpc/payment.router';
import { createReportRouter } from '@/server/presentation/trpc/report.router';
import { router } from '@/server/presentation/trpc/trpc';

const repository = new PostgresPaymentAccountingRepository();
const listOrders = new ListOrdersUseCase(repository);

export const appRouter = router({
  orders: createOrderRouter(listOrders),
  payments: createPaymentRouter(new AddPaymentUseCase(repository)),
  reports: createReportRouter(new GetPaymentReportUseCase(listOrders)),
});

export type AppRouter = typeof appRouter;
