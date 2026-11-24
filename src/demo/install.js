/**
 * Demo API seam. Importing this module (from `config/site.js` and the Mini App
 * data module) makes `fetch('/api/v1/...')` resolve against the in-memory engine
 * unless `VITE_API_MODE=live`, in which case nothing is patched and the SDK
 * talks to the real Joorchin platform. Reset the demo data with `?demo=reset`.
 */
import { ApiError, ensureLoaded, handle, resetDemo } from './engine.js';

// Keep interactive local previews self-contained, but never ship the demo API
// in a production build unless a demo artifact was explicitly requested.
const MODE = import.meta.env?.VITE_API_MODE ?? (import.meta.env?.PROD ? 'live' : 'demo');
if (MODE !== 'demo' && MODE !== 'live') {
  throw new Error(`[clinic] Unsupported VITE_API_MODE "${MODE}"; use "demo" or "live".`);
}
const APP_ID = String(import.meta.env?.VITE_APP_ID ?? 'test-id');
const g = globalThis;

function json(status, body) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

if (MODE !== 'live' && typeof g.fetch === 'function' && !g.__clinicDemoInstalled) {
  g.__clinicDemoInstalled = true;
  if (new URLSearchParams(g.location?.search ?? '').get('demo') === 'reset') {
    try { localStorage.removeItem('clinic-demo-store-v2'); } catch { /* ignore */ }
  }
  ensureLoaded();
  if (new URLSearchParams(g.location?.search ?? '').get('demo') === 'reset') resetDemo();
  const realFetch = g.fetch.bind(g);
  g.fetch = async (input, init = {}) => {
    const req = typeof input === 'string' || input instanceof URL ? null : input;
    const raw = req ? req.url : String(input);
    const url = new URL(raw, g.location?.origin ?? 'http://localhost');
    const m = url.pathname.match(/^\/api\/v1\/(?:apps\/([^/]+)\/)?(.*)$/);
    if (!m) return realFetch(input, init);
    const headers = {};
    new Headers(init.headers ?? req?.headers ?? {}).forEach((v, k) => { headers[k.toLowerCase()] = v; });
    let body;
    const text = init.body ?? (req ? await req.clone().text().catch(() => '') : undefined);
    if (typeof text === 'string' && text) { try { body = JSON.parse(text); } catch { body = undefined; } }
    const method = String(init.method ?? req?.method ?? 'GET').toUpperCase();
    const query = Object.fromEntries(url.searchParams);
    // Platform-level auth routes (`/api/v1/auth/...`) carry the app in a header.
    const appId = m[1] ?? headers['x-app-id'] ?? APP_ID;
    await new Promise((r) => setTimeout(r, 60 + Math.random() * 120)); // realistic latency
    try {
      const out = handle(appId, method, decodeURIComponent(m[2]).replace(/\/$/, ''), { method, query, body, headers });
      return json(out.status, out.body);
    } catch (e) {
      if (e instanceof ApiError) return json(e.status, { error: { code: e.code, message: e.message } });
      console.error('[demo-api]', e);
      return json(500, { error: { code: 'INTERNAL', message: 'خطای داخلی (حالت نمایشی)' } });
    }
  };
}
export const demoMode = MODE !== 'live';
