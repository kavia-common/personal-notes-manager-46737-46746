import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Configure Remix v3 future flags directly in the plugin without TS module augmentation.
// This avoids TypeScript config-time errors in Vite's Node context.
export default defineConfig(() => {
  // Read environment variables (Vite exposes import.meta.env.* in client; here we are in Node)
  const env = process.env ?? {};
  const rawPort = env.VITE_PORT || env.PORT;
  const port = rawPort ? Number(rawPort) : 3000;

  return {
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      port,
      // Keep strictPort so CI/preview knows if 3000 is already used; fail fast rather than silently switching ports.
      strictPort: true,
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      // In some remote/preview environments, explicit HMR configuration is required so the browser connects back properly.
      hmr: {
        protocol: env.VITE_HMR_PROTOCOL || "ws",
        // Use the same port by default; some proxies rewrite to a public port automatically.
        clientPort: env.VITE_HMR_CLIENT_PORT ? Number(env.VITE_HMR_CLIENT_PORT) : port,
        host: env.VITE_HMR_HOST || undefined,
      },
      watch: {
        // Polling helps containerized environments that don't propagate FS events
        usePolling: true,
      },
    },
    preview: {
      host: "0.0.0.0",
      port,
      strictPort: true,
    },
  };
});
