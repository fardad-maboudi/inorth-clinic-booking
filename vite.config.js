import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { VitePWA } from "vite-plugin-pwa";
import joorchinVitePlugin from "./vite-plugin/index.js";
import { pwaConfig } from "./src/config/pwa.js";

const packageDependencies = Object.keys(
  createRequire(import.meta.url)("./package.json").dependencies,
).filter((name) => !name.startsWith("@babel/") && !name.startsWith("@joorchin/"));
const optimizedDependencies = [
  ...packageDependencies,
  "react-dom/client",
  "react/jsx-runtime",
];

export default defineConfig(async ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const localSiteUi = process.env.APP_ENV === "development"
    ? "/opt/joorchin-site-ui/src"
    : null;
  const base = env.VITE_BASE || process.env.VITE_BASE || "/";
  const appId =
    env.VITE_APP_ID || process.env.VITE_APP_ID || "6ae869523c5af491ed8a859b";
  const serverTarget =
    env.VITE_JOORCHIN_SERVER_URL || process.env.VITE_JOORCHIN_SERVER_URL || "https://api.joorchin.site";

  return {
    base,
    // Preview containers run as uid 1000 on a --read-only rootfs, with the
    // node_modules named volume seeded root-owned from the image. Vite's default
    // cacheDir (node_modules/.vite) is therefore unwritable → EACCES on the dep
    // optimizer's deps_temp mkdir, which blanks the preview. /tmp is a writable
    // tmpfs in every preview container, so put the optimizer cache there.
    cacheDir: process.platform === "win32" ? undefined : "/tmp/.vite",
    define: {
      "import.meta.env.VITE_APP_ID": JSON.stringify(appId),
      "import.meta.env.VITE_JOORCHIN_SERVER_URL": JSON.stringify(serverTarget),
    },
    // Pre-bundle the core runtime libs at server boot in a single optimize
    // pass. Without this, Vite lazily re-optimizes react-router-dom (and other
    // deps) on first navigation, producing mixed `?v=<hash>` chunks where
    // react-router-dom loads against a stale/null React instance — the page
    // throws "Cannot read properties of null (reading 'useRef')" at
    // BrowserRouter and the preview blanks until a manual reload. Including
    // them here makes the bundle deterministic and kills the first-load race.
    optimizeDeps: {
      include: optimizedDependencies,
      noDiscovery: true,
    },
    build: {
      // Published sites stream browser errors into run-time telemetry
      // (public/runtime-telemetry.js -> POST /apps/:id/telemetry). Without
      // maps every frame arrives as `index-a1b2c3.js:1:48210`, which no one can
      // act on. "hidden" writes the .map files next to each chunk but omits the
      // `//# sourceMappingURL` comment, so nothing advertises them in devtools
      // while a symbolicator can still fetch `/assets/<chunk>.js.map` directly.
      // Cost: the .map files ship in the prod image alongside dist/.
      sourcemap: "hidden",
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, "index.html"),
          miniapp: resolve(import.meta.dirname, "miniapp/index.html"),
        },
      },
    },
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: localSiteUi ? {
        "@joorchin/site-ui/telegram": resolve(localSiteUi, "telegram.jsx"),
        "@joorchin/site-ui": resolve(localSiteUi, "index.jsx"),
        "@": resolve(import.meta.dirname, "src"),
      } : { "@": resolve(import.meta.dirname, "src") },
    },
    server: {
      host: true,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: serverTarget,
          changeOrigin: true,
          secure: true,
        },
      },
      fs: {
        ...(localSiteUi ? { allow: [resolve(import.meta.dirname), localSiteUi] } : {}),
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/.joorchin/**"],
      },
      ...(localSiteUi ? { watch: { usePolling: true } } : {}),
    },
    plugins: [
      react(),
      // Vite resolves dynamic imports before eliminating the PROD branch in
      // main.jsx. Disabled PWA deliberately provides no virtual module, so
      // preview and disabled-PWA builds need an explicit inert registration.
      ...((command === "serve" || pwaConfig.enabled === false) ? [{
        name: "joorchin-pwa-registration-disabled",
        enforce: "pre",
        resolveId(id) { return id === "virtual:pwa-register" ? "\0joorchin:pwa-disabled" : undefined; },
        load(id) { return id === "\0joorchin:pwa-disabled" ? "export const registerSW = () => () => Promise.resolve();" : undefined; },
      }] : []),
      // Vendored, base44-free plugin (see ./vite-plugin/index.js). The runtime
      // injection scripts are served from public/, so no path rewriting is needed.
      ...joorchinVitePlugin({
        hmrNotifier: true,
      }),
      VitePWA({
        // Preview uses `vite` (dev). This plugin only emits a SW on `vite build`.
        disable: pwaConfig.enabled === false,
        registerType: "autoUpdate",
        // Registration is website-entry code below; never inject it into miniapp/index.html.
        injectRegister: null,
        devOptions: { enabled: false },
        includeAssets: [
          "icons/icon-192.png",
          "icons/icon-512.png",
          "offline.html",
        ],
        manifest: {
          name: pwaConfig.name || "My Site",
          short_name: pwaConfig.shortName || "Site",
          description: pwaConfig.description || "Built with Joorchin",
          theme_color: pwaConfig.themeColor || "#99002e",
          background_color: pwaConfig.backgroundColor || "#ffffff",
          display: pwaConfig.display || "standalone",
          lang: pwaConfig.lang || "fa",
          dir: pwaConfig.dir || "rtl",
          start_url: pwaConfig.startUrl || "/",
          scope: pwaConfig.scope || "/",
          icons: [
            {
              src: "icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//, /^\/miniapp(?:\/|$)/],
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
        },
      }),
    ],
  };
});
