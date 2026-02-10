import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type PluginOption } from "vite"
import dotenv from "dotenv";
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  base: "/tracelet-docs/",
  plugins: [react(), tailwindcss()] as PluginOption[],
  envPrefix: "TRACELET_DOC_",
  define: {
    "process": process.env,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
