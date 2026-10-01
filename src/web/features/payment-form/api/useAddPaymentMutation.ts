import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/web/trpc';

export function useAddPaymentMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.payments.add.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.orders.list.queryFilter());
      },
    }),
  );
}
