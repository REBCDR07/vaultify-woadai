import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

let componentTagger: (() => unknown) | null = null;

try {
  const mod = await import("lovable-tagger");
  componentTagger = mod.componentTagger;
} catch {
  // Optional in local/dev contexts.
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    // Disable HMR websocket to avoid white-screen issues on environments
    // where WS upgrade is blocked/misconfigured.
    hmr: false,
  },
  plugins: [react(), mode === "development" && componentTagger?.()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
