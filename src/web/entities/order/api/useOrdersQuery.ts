import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/web/trpc';

export function useOrdersQuery() {
  const trpc = useTRPC();

  return useQuery(trpc.orders.list.queryOptions());
}
