import { TRPCError } from '@trpc/server';
import {
  AddPaymentUseCase,
  OrderNotFoundError,
} from '@/server/application/use-cases/add-payment.use-case';
import { addPaymentInput } from '@/server/presentation/trpc/payment.schemas';
import { publicProcedure, router } from '@/server/presentation/trpc/trpc';

export const createPaymentRouter = (addPayment: AddPaymentUseCase) =>
  router({
    add: publicProcedure.input(addPaymentInput).mutation(async ({ input }) => {
      try {
        return await addPayment.execute(input);
      } catch (error) {
        if (error instanceof OrderNotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }
        throw error;
      }
    }),
  });
