import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern' },
    },
  },
  server: {
    port: 5173,
    proxy: { '/trpc': { target: 'http://localhost:3001', changeOrigin: true } },
  },
});
