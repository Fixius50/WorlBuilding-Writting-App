import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@database': path.resolve(__dirname, './src/infrastructure/localDB/client'),
      '@context': path.resolve(__dirname, './src/context'),
      '@network': path.resolve(__dirname, './src/infrastructure/network'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@repositories': path.resolve(__dirname, './src/infrastructure/localDB/repositories'),
      '@atoms': path.resolve(__dirname, './src/presentation/atoms'),
      '@molecules': path.resolve(__dirname, './src/presentation/molecules'),
      '@organisms': path.resolve(__dirname, './src/presentation/organisms'),
      '@layout': path.resolve(__dirname, './src/presentation/layout'),
      '@utils': path.resolve(__dirname, './src/infrastructure/utils'),
      '@locales': path.resolve(__dirname, './src/locales'),
      '@store': path.resolve(__dirname, './src/store'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es'
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [
        '..', // Permitir acceso a la raíz (para node_modules externos)
      ],
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  optimizeDeps: {
    exclude: ['sqlocal'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
      }
    }
  }
});
