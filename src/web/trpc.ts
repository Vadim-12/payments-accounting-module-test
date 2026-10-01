import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import superjson from 'superjson';
import type { AppRouter } from '@/server/presentation/trpc/app.router';

const apiUrl = import.meta.env.VITE_API_URL ?? '/trpc';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: apiUrl, transformer: superjson })],
});

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
