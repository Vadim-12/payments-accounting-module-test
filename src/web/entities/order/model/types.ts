import type { trpc } from '@/web/trpc';

export type Order = Awaited<ReturnType<typeof trpc.orders.list.query>>[number];
export type OrderStatus = Order['status'];
