import { GetPaymentReportUseCase } from '@/server/application/use-cases/get-payment-report.use-case';
import { publicProcedure, router } from '@/server/presentation/trpc/trpc';

export const createReportRouter = (getReport: GetPaymentReportUseCase) =>
  router({ get: publicProcedure.query(() => getReport.execute()) });
