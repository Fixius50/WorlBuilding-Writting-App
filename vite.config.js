import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
    ],
    base: '/', // Absolute path for deep linking support
    root: path.resolve(__dirname, 'src/main/frontend'),
    build: {
        outDir: path.resolve(__dirname, 'src/main/resources/static'),
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'src/main/frontend/index.html'),
        },
    },
    server: {
        host: process.env.TAURI_DEV_HOST || false,
        port: 3000,
        strictPort: true,
        open: false, 
    },
    envPrefix: ['VITE_', 'TAURI_ENV_'],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/main/frontend/src'),
            'react': path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
    },
})
