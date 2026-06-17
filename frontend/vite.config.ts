import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/features/Shared"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@database": path.resolve(
        __dirname,
        "./src/infrastructure/localDB/client",
      ),
      "@context": path.resolve(__dirname, "./src/features/App/context"),
      "@network": path.resolve(__dirname, "./src/infrastructure/network"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@domain/database": path.resolve(
        __dirname,
        "./src/features/App/domain/database",
      ),
      "@domain/maps": path.resolve(
        __dirname,
        "./src/features/Maps/domain/maps",
      ),
      "@domain/timeline": path.resolve(
        __dirname,
        "./src/features/Timeline/domain/timeline",
      ),
      "@domain/writing": path.resolve(
        __dirname,
        "./src/features/Writing/domain/writing",
      ),
      "@domain/linguistics": path.resolve(
        __dirname,
        "./src/features/Linguistics/domain/linguistics",
      ),
      "@domain/canvas": path.resolve(
        __dirname,
        "./src/features/Linguistics/domain/canvas",
      ),
      "@domain/hierarchy": path.resolve(
        __dirname,
        "./src/features/WorldBible/domain/hierarchy",
      ),
      "@domain/graph": path.resolve(
        __dirname,
        "./src/features/Graph/domain/graph",
      ),
      "@domain/ui": path.resolve(__dirname, "./src/features/Shell/domain/ui"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@repositories": path.resolve(
        __dirname,
        "./src/infrastructure/localDB/repositories",
      ),
      "@utils": path.resolve(__dirname, "./src/infrastructure/utils"),
      "@locales": path.resolve(__dirname, "./src/locales"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    format: "es",
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [
        "..", // Permitir acceso a la raíz (para node_modules externos)
      ],
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },
  optimizeDeps: {
    exclude: ["sqlocal"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {},
    },
  },
});
