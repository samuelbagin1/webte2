import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_BACKEND_URL ?? "http://localhost:3001";
  const wsBackend = backend.replace(/^http/, "ws");

  return {
    plugins: [react()],
    base: '/task3/',
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": { target: backend, changeOrigin: true },
        "/ws": { target: wsBackend, ws: true, changeOrigin: true },
      },
    },
  };
});
