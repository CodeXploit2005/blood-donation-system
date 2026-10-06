import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: Number(process.env.CLIENT_PORT || 5173),
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || loadEnv(mode, process.cwd(), '').API_PROXY_TARGET || 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
