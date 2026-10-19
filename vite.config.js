import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    target: "esnext",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        mesa: resolve(import.meta.dirname, "mesa-3d/index.html"),
      },
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-ui": ["lucide-react", "canvas-confetti"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
