import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '@/server/presentation/trpc/app.router';
import { createContext } from '@/server/presentation/trpc/trpc';

const app = express();
const port = Number(process.env.PORT ?? 3001);
const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const webBuildDirectory = resolve(projectDirectory, 'dist');

app.use(cors({ origin: 'http://localhost:5173' }));
app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));
app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(webBuildDirectory));
  app.get('*', (_request, response) => response.sendFile(resolve(webBuildDirectory, 'index.html')));
}

app.listen(port, () => console.log(`tRPC API is running at http://localhost:${port}/trpc`));
