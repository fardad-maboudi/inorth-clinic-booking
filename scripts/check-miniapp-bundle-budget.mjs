import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { gzipSync } from 'node:zlib';

/** Normalize a Vite `base` to `/…/` form (`/`, `/app/<id>/`). */
export function normalizeBase(base) {
  const raw = typeof base === 'string' && base.trim() ? base.trim() : '/';
  const leading = raw.startsWith('/') ? raw : `/${raw}`;
  return leading.endsWith('/') ? leading : `${leading}/`;
}

/**
 * Map a same-origin `<script src>` to its file in `dist/`.
 *
 * Previews build with `VITE_BASE=/app/<appId>/`, so every emitted URL carries
 * that prefix while the file sits at `dist/<file>`. Stripping only the leading
 * `/` (the original behaviour) resolved to `dist/app/<appId>/…`, which never
 * exists, and crashed every preview build check (2026-09-23, app 6ab433d1…).
 */
export function distPathForScript(distDir, src, base = '/') {
  const prefix = normalizeBase(base);
  let path = src.split(/[?#]/)[0];
  if (prefix !== '/' && path.startsWith(prefix)) path = path.slice(prefix.length);
  return resolve(distDir, path.replace(/^\//, ''));
}

export function initialMiniAppJsBytes(distDir, base = process.env.VITE_BASE || '/') {
  const htmlPath = resolve(distDir, 'miniapp/index.html');
  const html = readFileSync(htmlPath, 'utf8');
  const queue = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)]
    .map((match) => match[1])
    // Telegram's bridge is loaded from the network and is not part of our
    // shipped bundle budget.
    .filter((src) => !/^(?:[a-z]+:)?\/\//i.test(src))
    .map((src) => distPathForScript(distDir, src, base));
  const seen = new Set();
  const missing = [];
  let bytes = 0;
  while (queue.length) {
    const file = queue.pop();
    if (!file || seen.has(file)) continue;
    seen.add(file);
    if (!existsSync(file)) {
      missing.push(file);
      continue;
    }
    const source = readFileSync(file);
    bytes += gzipSync(source).byteLength;
    const text = source.toString('utf8');
    for (const match of text.matchAll(/(?:from\s*|import\s*)["'](\.\.?\/[^"']+\.js)["']/g)) queue.push(resolve(dirname(file), match[1]));
  }
  if (missing.length) {
    // A measurement fault, not a budget overrun: name it as the platform's so
    // the build check never hands it to the site builder as something to fix.
    throw new Error(
      `JRC_MINIAPP_BUDGET_MEASUREMENT_ERROR: script(s) referenced by dist/miniapp/index.html not found in dist (base ${normalizeBase(base)}): ${missing.join(', ')}`,
    );
  }
  return bytes;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const bytes = initialMiniAppJsBytes(resolve(process.cwd(), 'dist'));
  const limit = 180 * 1024;
  // Print the measurement before judging it: the preview build check only
  // records this line as evidence, and be/core enforces the budget for
  // Telegram-surface runs (quality/telegram-miniapp-gate.ts).
  console.log(`Mini App initial JS: ${bytes} gzip bytes (budget ${limit})`);
  if (bytes > limit) throw new Error(`Mini App initial JS is ${bytes} gzip bytes; budget is ${limit}`);
}
