import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/presentation/trpc/app.router';

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Order = RouterOutputs['orders']['list'][number];
export type OrderStatus = Order['status'];
