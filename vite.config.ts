import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      assetsDir: "assets",
      outDir: "dist",
      rollupOptions: {
        output: {
          // go embed ignore files start with '_'
          chunkFileNames: "assets/chunk-[name]-[hash].js",
          entryFileNames: "assets/entry-[name]-[hash].js",
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
          },
        },
      },
    },
    server: {
      host: "127.0.0.1",
      proxy: {
        "/api": {
          target: env.VITE_API_TARGET || "http://localhost:3000",
          changeOrigin: true,
          ws: true,
          secure: false,
        },
      },
    },
  };
});
