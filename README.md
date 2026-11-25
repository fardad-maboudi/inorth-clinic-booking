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

Pages import the delivered `@/api/plugins/*` (visitor) and
`@/api/backoffice/*` (staff-only) modules rather than constructing platform
URLs in components. Live app-scoped auth, entity, visitor/staff plugin-record
and action, team, integration, and booking calls use `@joorchin/client-sdk`
0.3.1 where its public contracts match; remaining custom service routes use the
shared fetch transport. Auth and refresh use app-scoped routes
(`/apps/:appId/auth/...`, including
`/apps/:appId/auth/refresh`), while profile reads/updates use
`/apps/:appId/users/me`. Both transports share the delivered app's access token;
the SDK owns refresh rotation and mirrors the pair back to the site's auth store.

Set `VITE_JOORCHIN_SERVER_URL` to the Joorchin API origin (without `/api/v1`);
this clinic defaults to `https://api.joorchin.site`. A stale Pinggy value in
`VITE_JOORCHIN_SERVER_URL` is treated as a temporary tunnel and resolves to the
official API instead. Local checkout callbacks ignore `VITE_PUBLIC_URL` and
`VITE_APP_URL`, using the registered `preview.joorchin.site` app URL rather than
a tunnel URL. Vite dev proxies `/api` to the API origin, while the production
SDK and shared fetch transport call the origin directly. Demo mode remains the
default in development and is intercepted in-browser. Production builds default to
`VITE_API_MODE=live`, and `Dockerfile.prod` explicitly sets it to `live`. To produce
an intentional demo artifact, opt in with `VITE_API_MODE=demo` (or Docker's
`--build-arg VITE_API_MODE=demo`). For a customer-hosted production image, pass
`--build-arg VITE_JOORCHIN_SERVER_URL=https://<your-joorchin-api-origin>` as well
as `VITE_APP_ID`.

The production Docker image is static Nginx and does not define an `/api` proxy.
Direct browser-to-API calls therefore require the Joorchin API to allow the
published site's exact origin, `OPTIONS` preflight, the used methods (`GET`,
`POST`, `PUT`, `PATCH`, `DELETE`), and request headers such as `Authorization`,
`Content-Type`, `X-App-Id`, `X-Joorchin-Client`, `x-booking-session`,
`x-cart-session`, and `x-joorchin-surface`. SDK 0.3.1 sends browser credentials
on requests without an SDK-owned bearer session, so the API must return
`Access-Control-Allow-Credentials: true`
and an explicit allowed origin for those calls; `Access-Control-Allow-Origin: *`
is incompatible. When the SDK has its own bearer session it disables cookies
and sends the token instead. Verify CORS, app-scoped routes, and deployment
routing before release. Install the required plugins on the Joorchin app and apply
`seed/clinic-seed-pack.ts` through the plugin routes before enabling live
booking. SDK wiring does not itself install plugins or fix server-side
authorization/business rules.

The in-browser engine is an approximate local simulator, not a security or
business-rule guarantee for the live service. Its behavior has known deviations
from the desired booking contract; do not use demo results to sign off live
authorization, booking, payment, or credit behavior.

## Feature coverage

See `FEATURES.md`.
