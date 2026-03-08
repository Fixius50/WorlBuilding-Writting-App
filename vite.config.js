import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        electron({
            main: {
                entry: path.resolve(__dirname, 'electron/main.ts'),
                vite: { build: { outDir: path.resolve(__dirname, 'dist-electron') } }
            },
            preload: {
                input: path.resolve(__dirname, 'electron/preload.ts'),
                vite: { build: { outDir: path.resolve(__dirname, 'dist-electron') } }
            },
            renderer: {},
        }),
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
        host: 'localhost',
        port: 3000,
        open: true, // Force open browser on port 3000
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/main/frontend/src'),
            'react': path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
    },
})
