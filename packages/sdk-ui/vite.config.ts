import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import { dynamicBase } from "vite-plugin-dynamic-base";
import dotenv from "dotenv";
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  base: "/__dynamic_base__",
  plugins: [
    dynamicBase({
      transformIndexHtml: true,
    }),
    react(),
    tailwindcss(),
  ] as PluginOption[],
  envPrefix: "TRACELET_DOC_",
  define: {
    process: process.env,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
