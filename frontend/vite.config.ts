import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const resolveFromRoot = (target: string): string =>
  path.resolve(__dirname, target);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": resolveFromRoot("./src/features/Shared"),
      "@features": resolveFromRoot("./src/features"),
      "@database": resolveFromRoot("./src/infrastructure/localDB/client"),
      "@context": resolveFromRoot("./src/features/App/context"),
      "@network": resolveFromRoot("./src/infrastructure/network"),
      "@assets": resolveFromRoot("./src/assets"),
      "@domain/database": resolveFromRoot("./src/features/App/domain/database"),
      "@domain/maps": resolveFromRoot("./src/features/Maps/domain/maps"),
      "@domain/timeline": resolveFromRoot(
        "./src/features/Timeline/domain/timeline",
      ),
      "@domain/writing": resolveFromRoot(
        "./src/features/Writing/domain/writing",
      ),
      "@domain/linguistics": resolveFromRoot(
        "./src/features/Linguistics/domain/linguistics",
      ),
      "@domain/canvas": resolveFromRoot(
        "./src/features/Linguistics/domain/canvas",
      ),
      "@domain/hierarchy": resolveFromRoot(
        "./src/features/WorldBible/domain/hierarchy",
      ),
      "@domain/graph": resolveFromRoot("./src/features/Graph/domain/graph"),
      "@domain/ui": resolveFromRoot("./src/features/Shell/domain/ui"),
      "@infrastructure": resolveFromRoot("./src/infrastructure"),
      "@repositories": resolveFromRoot(
        "./src/infrastructure/localDB/repositories",
      ),
      "@utils": resolveFromRoot("./src/infrastructure/utils"),
      "@locales": resolveFromRoot("./src/locales"),
      "@": resolveFromRoot("./src"),
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
