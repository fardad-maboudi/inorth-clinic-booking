# Clinic & salon booking showcase («کلینیک زیبایی نیلوفر»)

A Persian/RTL booking and membership site on the Joorchin generated-site base
(React 19, Vite, Tailwind v4) and the Joorchin SDK surfaces. It runs with a plain
Vite dev server against an **in-browser demo API**; there is no backend to start.

```bash
pnpm install
pnpm dev            # http://localhost:5173  (Mini App: /miniapp/)
pnpm build          # vite build, produces dist/
```

Demo logins (any OTP code works): member `09121110001` at `/auth/login`,
staff `09120000101` at `/admin/login`, then `/panel`. Reset demo data with `?demo=reset`.

## Layout

| Path | Contents |
|---|---|
| `src/pages`, `src/components/{site,panel}` | Visitor pages, the `/panel` back-office, shared UI |
| `src/miniapp/{pages,components}` | Telegram Mini App booking screens |
| `src/demo/` | Demo API seam (`engine.js`, `seed-data.js`, `install.js`) |
| `seed/` | Clinic seed pack (`clinic-seed-pack.ts`) for services, staff, and schedule setup |
| `public/` | Static assets |

## SDK integration seam

Pages import only `@/api/plugins/*` (visitor) and `@/api/backoffice/*` (panel, staff
only), never raw URLs. Those SDK modules call `fetch('/api/v1/apps/<id>/...')`.
`src/demo/install.js` (imported from `src/config/site.js` and the Mini App data
module) answers those calls from `engine.js` unless `VITE_API_MODE=live`, in which
case nothing is patched and the app talks to the real platform. To go live: set
`VITE_API_MODE=live`, delete `src/demo/` and its two imports, install the plugins
on a Joorchin app and apply `seed/clinic-seed-pack.ts` through the plugin routes.

The engine mirrors the real bookings contract: one atomic seat claim per slot
(parallel requests for one seat give one booking and 409s), cancel/reschedule
windows, credit consume/restore, credits visible to a client only when linked to
their account, no-show counters with auto-block, Nowruz closure, staff-only routes.

## Feature coverage

See `FEATURES.md`.
