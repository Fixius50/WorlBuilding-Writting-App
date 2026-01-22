import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './', // Ensure relative paths
    root: path.resolve(__dirname, 'src/main/frontend'),
    build: {
        outDir: path.resolve(__dirname, 'src/main/resources/static'),
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'src/main/frontend/index.html'),
        },
    },
    server: {
        // Ensure we bind to all interfaces if needed, though localhost is fine
        host: true,
        port: 3000,
        proxy: {
            // General capture for API requests
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
            // Explicitly proxy some other known root-level paths if they exist entirely on backend (fallback)
            // But usually /api capture is enough if code uses it.
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/main/frontend'),
            'react': path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
    },
})
