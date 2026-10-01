import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/presentation/trpc/app.router';

const apiUrl = import.meta.env.VITE_API_URL ?? '/trpc';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: apiUrl, transformer: superjson })],
});
