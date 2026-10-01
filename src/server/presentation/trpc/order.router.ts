import { ListOrdersUseCase } from '@/server/application/use-cases/list-orders.use-case';
import { publicProcedure, router } from '@/server/presentation/trpc/trpc';

export const createOrderRouter = (listOrders: ListOrdersUseCase) =>
  router({ list: publicProcedure.query(() => listOrders.execute()) });
