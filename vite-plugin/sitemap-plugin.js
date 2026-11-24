/**
 * Build-time `sitemap.xml` + `robots.txt` generation.
 *
 * Replaces the hand-authored pair that used to ship as static stubs in
 * `public/`. Two things were wrong with those, in every published app:
 *
 *   1. `<loc>/</loc>` — the sitemaps protocol requires ABSOLUTE URLs. A
 *      relative `loc` is rejected outright, so the file indexed nothing. Same
 *      for the `Sitemap: /sitemap.xml` line in robots.txt.
 *   2. It listed exactly one URL ("/") no matter how many pages the agent
 *      wrote, so every page past the homepage was invisible to crawlers.
 *
 * Routes are derived from `src/lib/page-routes.js` — the SAME module
 * `src/App.jsx` routes with — so the sitemap cannot advertise a URL the router
 * does not serve, nor miss one it does. That is the whole reason this is
 * generated rather than written: a hand-maintained copy drifts, which is the
 * failure `src/lib/page-routes.js` itself exists to prevent.
 *
 * Origin comes from `VITE_SITE_URL` (a build arg; see Dockerfile.prod). With no
 * origin configured there is no correct absolute URL to emit, so `sitemap.xml`
 * is skipped and `robots.txt` ships without a `Sitemap:` line — strictly better
 * than emitting an invalid file that crawlers discard.
 *
 * An app that ships its own `public/sitemap.xml` or `public/robots.txt` keeps
 * it: the generator defers rather than fighting Vite's publicDir copy.
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  isPageModule,
  isPluginScaffoldPage,
  isTransactionalOrAuthPath,
  pageRoutePath,
} from "../src/lib/page-routes.js";

/** `VITE_SITE_URL` -> `https://host` (no path, no trailing slash), or null. */
export function resolveSiteOrigin(env = {}) {
  const raw = String(env.VITE_SITE_URL || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

/** Join Vite's `base` with a router path into one absolute-path string. */
export function joinBase(base, routePath) {
  const prefix = String(base || "/").replace(/\/+$/, "");
  const suffix = routePath === "/" ? "" : routePath;
  return `${prefix}${suffix}` || "/";
}

/** Every `src/pages/**\/*.jsx` under `root`, as forward-slash repo paths. */
export function listPageFiles(root) {
  const pagesDir = path.join(root, "src", "pages");
  if (!existsSync(pagesDir)) return [];

  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".jsx")) {
        const rel = path.relative(pagesDir, full).split(path.sep).join("/");
        found.push(`src/pages/${rel}`);
      }
    }
  };
  walk(pagesDir);
  return found.sort();
}

/**
 * Page files -> the indexable route list, mirroring `App.jsx`:
 * same `isPageModule` filter, same sort, same index promotion.
 *
 * Then drops what must never be in a sitemap:
 *   - `[param]` routes, which need data this build does not have;
 *   - cart / checkout / order / auth / install, which are transactional
 *     (`isTransactionalOrAuthPath`) and waste crawl budget at best.
 */
export function sitemapRoutes(files) {
  const pages = files
    .filter(isPageModule)
    .sort()
    .map((file) => ({ file, path: pageRoutePath(file) }));

  // Mirrors `promoteIndexRoute` in App.jsx: with no Home/Index page, the first
  // agent-written page IS the homepage, and the sitemap must say so.
  if (!pages.some((page) => page.path === "/")) {
    const promotable = pages.find((page) => !isPluginScaffoldPage(page.file));
    if (promotable) promotable.path = "/";
  }

  const seen = new Set();
  return pages
    .filter((page) => page.path && !page.path.includes(":"))
    .filter((page) => !isTransactionalOrAuthPath(page.path))
    .filter((page) => (seen.has(page.path) ? false : seen.add(page.path)))
    .map((page) => page.path)
    .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderSitemap(origin, base, routes, lastmod) {
  const entries = routes.map((route) => {
    const loc = xmlEscape(`${origin}${joinBase(base, route)}`);
    const priority = route === "/" ? "1.0" : "0.7";
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      "    <changefreq>weekly</changefreq>",
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

export function renderRobots(origin, base, hasArticles = false) {
  const lines = ["User-agent: *", "Allow: /"];
  if (origin) {
    lines.push("", `Sitemap: ${origin}${joinBase(base, "/sitemap.xml")}`);
    if (hasArticles) lines.push(`Sitemap: ${origin}/articles/sitemap.xml`);
  }
  return `${lines.join("\n")}\n`;
}

export function sitemapPlugin() {
  let root = process.cwd();
  let base = "/";
  let publicDir = "";
  let origin = null;

  const build = () => {
    const routes = sitemapRoutes(listPageFiles(root));
    const lastmod = new Date().toISOString().slice(0, 10);
    const hasArticles = existsSync(path.join(root, "src/api/plugins/cms.js"));
    return {
      routes,
      robots: renderRobots(origin, base, hasArticles),
      sitemap: origin ? renderSitemap(origin, base, routes, lastmod) : null,
    };
  };

  /** An app-authored `public/` twin wins; Vite would flag the collision anyway. */
  const appOwns = (name) => Boolean(publicDir) && existsSync(path.join(publicDir, name));

  return {
    name: "joorchin:sitemap",
    configResolved(config) {
      root = config.root;
      base = config.base || "/";
      publicDir = config.publicDir || "";
      origin = resolveSiteOrigin(process.env);
    },
    configureServer(server) {
      // Dev/preview serves the same bytes the build emits, so what the agent
      // and the visual reviewer see is what crawlers will get.
      server.middlewares.use((req, res, next) => {
        const url = (req.url || "").split("?")[0];
        const wantsRobots = url.endsWith("/robots.txt");
        const wantsSitemap = url.endsWith("/sitemap.xml");
        if (!wantsRobots && !wantsSitemap) return next();
        if (appOwns(wantsRobots ? "robots.txt" : "sitemap.xml")) return next();

        const generated = build();
        const body = wantsRobots ? generated.robots : generated.sitemap;
        if (!body) return next();

        res.setHeader(
          "Content-Type",
          wantsRobots ? "text/plain; charset=utf-8" : "application/xml; charset=utf-8",
        );
        res.end(body);
      });
    },
    generateBundle() {
      const generated = build();

      if (!appOwns("robots.txt")) {
        this.emitFile({
          type: "asset",
          fileName: "robots.txt",
          source: generated.robots,
        });
      }

      if (appOwns("sitemap.xml")) return;
      if (!generated.sitemap) {
        this.warn(
          "VITE_SITE_URL is not set, so no sitemap.xml was emitted: the sitemaps " +
            "protocol requires absolute <loc> URLs and this build does not know " +
            "the site's public origin.",
        );
        return;
      }
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: generated.sitemap,
      });
    },
  };
}

export default sitemapPlugin;
