import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { DEFAULT_ORACLE_URL } from "./src/config.js";

// The full policy ships as a <meta> tag so it travels with the build to any static host;
// vercel.json adds the header-only directives (frame-ancestors). Production builds only:
// the dev server relies on inline scripts for HMR.
function contentSecurityPolicy(oracleUrl) {
  const oracleOrigin = new URL(oracleUrl).origin;
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    // React and Framer Motion set inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "media-src 'self' blob:",
    `connect-src 'self' ${oracleOrigin}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join("; ");
  return {
    name: "lumina-csp",
    apply: "build",
    transformIndexHtml: () => [
      { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: policy }, injectTo: "head-prepend" },
      { tag: "meta", attrs: { name: "referrer", content: "strict-origin-when-cross-origin" }, injectTo: "head-prepend" },
    ],
  };
}

export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    contentSecurityPolicy(loadEnv(mode, process.cwd(), "VITE_").VITE_ORACLE_API_URL || DEFAULT_ORACLE_URL),
  ],
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
}));
