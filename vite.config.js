import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Root is src/main/frontend where index.html and source code lives
    root: path.resolve(__dirname, 'src/main/frontend'),
    build: {
        // Output to src/main/resources/static
        outDir: path.resolve(__dirname, 'src/main/resources/static'),
        emptyOutDir: true, // Clean old assets
        rollupOptions: {
            input: path.resolve(__dirname, 'src/main/frontend/index.html'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            }
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
