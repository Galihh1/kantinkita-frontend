import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      allowedHosts: true,
      // Proxy hanya aktif di development
      proxy: isDev
        ? {
            '/api': {
              target: env.VITE_API_URL || 'http://localhost:8000',
              changeOrigin: true,
            },
          }
        : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
            charts: ['recharts'],
            realtime: ['laravel-echo', 'pusher-js'],
          },
        },
      },
    },
  };
});
