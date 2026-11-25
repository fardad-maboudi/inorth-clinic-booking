# Project Review Findings

- **Repository:** `fardad-maboudi/inorth-clinic-booking`
- **Branch:** `arena/8f5a194f-inorth-clinic-booking`
- **Review status:** Twelve prioritized findings are recorded below. The production-build demo default has been corrected in this branch; live API routing and backend behavior still need release verification.

## Scope and important caveats

The repository includes an in-browser demo API (`src/demo/engine.js` / `src/demo/install.js`) as well as clients intended to call Joorchin APIs. Findings marked **demo API** were confirmed against that local simulator; they do not establish that the corresponding live Joorchin backend routes have the same defects.

Before this branch's fix, `src/demo/install.js` defaulted an unset `VITE_API_MODE` to `demo`, and `Dockerfile.prod` did not override it. The app now defaults to `demo` only in Vite development and to `live` in production; `Dockerfile.prod` explicitly passes `VITE_API_MODE=live`. A demo artifact must now be requested explicitly. This prevents the reviewed Docker build from silently simulating OTPs, bookings, and checkout.

**Deployment gate:** the production Docker image is static Nginx and does not define an `/api` proxy. Live SDK calls and the shared fetch transport now target the configured `VITE_JOORCHIN_SERVER_URL` directly; the host does not need to proxy `/api`. Verify the published site's exact origin, CORS preflight methods/headers, and app-scoped routes. SDK 0.3.1 sends browser credentials on requests without an SDK-owned bearer session, so those routes need `Access-Control-Allow-Credentials: true` and an explicit allowed origin (not `*`). The dev-only Vite proxy is not present in the static Nginx image.

## Prioritized findings

### 1. [P1 — Fixed in this branch; verify API routing] Production builds must not silently use the demo API

`src/demo/install.js` previously used `VITE_API_MODE ?? 'demo'` and replaced API `fetch` calls unless the mode was `live`. `Dockerfile.prod` did not set the mode, so an ordinary Docker production build could ship simulated behavior: OTPs were simulated and checkout marked orders paid in browser-local data.

**Change made:** production Vite builds now default to `live`, local `vite` development still defaults to `demo`, invalid mode strings fail immediately, and `Dockerfile.prod` sets `VITE_API_MODE=live`. A demo build remains possible only by explicitly setting `VITE_API_MODE=demo` (or passing the Docker build argument).

**Remaining risk:** the production container has no `/api` proxy configuration. The live SDK and shared fetch transport now use the direct `VITE_JOORCHIN_SERVER_URL` origin. Verify that the API is reachable from the published site and supports CORS credentials on SDK requests without an SDK-owned bearer session, as well as the required headers/methods. The API host, CORS policy, and live route availability were not inspected.

### 2. [P1 — Security] Demo authentication can be forged, including staff access

`src/demo/engine.js` decodes the JWT payload without validating its signature, expiry, or app ID, and derives staff access from `tokenKind`. The Telegram Mini App auth route also grants owner access when the raw `initData` string contains `staff=1` or `owner=1`. Direct probes confirmed that a forged, expired, wrong-app `alg:none` token with `tokenKind: site_admin` could read owner membership data and create a staff-only booking. Unsigned Mini App input containing `staff=1` also returned an owner session.

**Scope:** demo engine only; live platform authentication and Telegram signature verification were not tested. The production-mode change prevents this simulator from being the default production API, but does not certify live auth.

### 3. [P1 — Privacy/access control] Demo record routes do not consistently enforce ownership

The generic record lookup returns records by ID without authentication. A direct booking lookup returned a customer phone number. A different signed-in account could fetch another account's order and support ticket, and could post a reply to that ticket. Relevant paths include generic plugin data reads, `plugins/ecommerce/orders/:id`, and `plugins/support-desk/tickets/:id` in `src/demo/engine.js`.

**Scope:** browser-local demo store; this is not evidence of cross-customer leakage from a live shared backend.

### 4. [P1 — Booking integrity] Slot generation and booking do not reconcile availability safely

`generateSlots()` appends rows rather than updating or replacing existing slots. One regeneration doubled the seed from 489 to 978 slots. Two duplicate rows for the same service, resource, and start time were both accepted as bookings. Two different services assigned to one resource could also be booked for the same start time.

Existing slot rows are not retired when schedules change. Adding time off did not invalidate slots that had already been generated; one such slot remained visible and bookable. The panel calls generation after schedule saves, so repeated saves can reproduce duplicate rows.

**Scope:** demo booking engine. The live backend's slot generation, concurrency, resource-overlap, schedule-change, and time-off behavior were not accessible for this review.

### 5. [P1 — Credit integrity] Credits can be spent by the wrong caller or restored twice

`consumeCreditRow()` checks ownership only when the caller has a user ID and does not validate the credit's eligible service IDs. A guest booking for a different service succeeded using another member's credit. Separately, rescheduling copies the credit ID to the replacement booking, while cancellation still accepts the original `rescheduled` booking; cancelling both restored the same credit twice (balance 3 → 4).

**Scope:** demo engine; live credit ownership, service eligibility, and idempotent restore behavior were not verified.

### 6. [P2 — Feature unavailable] Event signups fail in the demo API

The visitor client posts to `events/:id/book`, but the demo event route requires staff before handling event routes and has no visitor registration branch. Event creation succeeded; a member signup returned `403 FORBIDDEN`.

**Scope:** demo API/UI contract; live event registration was not tested.

### 7. [P2 — Booking friction] Availability shows slots the booking endpoint rejects

The demo availability route returns future slots without applying the configured lead time, while the booking route rejects starts inside that window. A slot 16 minutes away was returned as available, then rejected with `400` when booked.

**Scope:** demo API; this makes the visitor flow offer a time that cannot be selected successfully. Live availability/booking consistency was not tested.

### 8. [P2 — Cart isolation] Guest cart identity is ignored by the demo API

The ecommerce client sends `x-cart-session`, but the demo engine derives guest identity from `x-booking-session` and otherwise uses `anon`. Requests with distinct cart-session values shared the same guest cart; the second guest could see the first guest's item and check it out.

**Scope:** demo store/browser context; this does not demonstrate cross-device cart sharing in a live backend.

### 9. [P2 — Review integrity] A user can approve their own demo review

The demo review route sets `status: 'pending'` before spreading the request body. A signed-in caller can therefore submit `status: 'approved'`, and the review appears in the public list.

**Scope:** demo engine; live review moderation and public-list filtering were not tested.

### 10. [P2 — Loyalty integrity] Negative redemption amounts mint demo points

The demo loyalty route checks whether the member has fewer points than requested, then subtracts the requested amount without requiring it to be positive. Redeeming `-500` changed the seeded balance from 1,280 to 1,780.

**Scope:** demo engine; live loyalty redemption validation was not tested.

### 11. [P2 — Package fulfilment] The success-page copy conflicts with the staff workflow

The payment-success page says purchased sessions are already active and the booking CTA says they are in the account. The panel's package-order workflow tells staff to grant credits manually after payment. No client-side grant occurs in this repository. Unless a live backend automation grants credits independently, customers may be told they can use sessions before the credits exist.

**Scope:** repository-visible UI workflow; remote payment hooks or backend automation were not available to inspect.

### 12. [P2 — Contact] Phone links may be empty and phone numbers disagree

`src/config/site.js` stores the public phone using Persian digits, while `Contact.jsx` and `Layout.jsx` strip everything except ASCII digits and `+`. This yields an empty `tel:` target. Packages, Services, and Team also hard-code `02188888888`, which differs from the configured number. The intended public phone number should be verified before publishing.

## SDK package review and backend capability mapping

The Google Drive archive provided by the user, `@joorchin/client-sdk-0.3.1.tgz` (version `0.3.1`), was downloaded and reviewed: its package manifest and license, README, public TypeScript declarations/shared contracts, and the relevant bundled implementations for auth/session refresh, plugin calls, bookings, and HTTP handling. It is a **client** and API contract, not the Joorchin server implementation.

### What the SDK exposes

- **Auth/session:** customer OTP and password sign-in; separate staff OTP/password sign-in; customer/staff password recovery; profile read/update; session set/get/logout; app-scoped refresh-token renewal after an eligible 401. The docs require app-specific token-storage keys. Refresh is single-flight per client instance, not coordinated across tabs/independent server requests.
- **Bookings:** typed availability, book/cancel/reschedule, current-user bookings and credits, events and visitor registration/cancellation; staff operations for calendar, slot create/generate/delete, walk-ins, booking status transitions, credit grant/consume, services, saved locations, and booking Google integration. These methods call server routes; they do not implement the scheduling or credit business rules locally.
- **Site plugins:** `client.site.plugin(id).action(...)` and read-only plugin-data records; the SDK also exposes a push subscription helper. There is no dedicated visitor ecommerce-cart API in this release; generic plugin actions can call those routes.
- **Staff/back office:** capability-protected plugin actions and record writes, team/member helpers, media helpers, and named ecommerce actions such as order listing, manual-payment approval, fulfillment, cancellation, refund, product/customer management, and store settings.
- **Other public modules:** app entities, integration endpoints, server functions, app logs, agents, asset URLs, and an optional Rooms WebSocket client. Shared Zod schemas and `JoorchinError` are exported.
- **Security boundary:** the SDK does not grant permissions. The README says the server must enforce app scope, site membership, and each staff capability. Its `asServiceRole` transport requires a service token and must remain server-side; it must never be bundled into browser code. The package license restricts use to Joorchin-connected applications and requires its full text in third-party notices when the SDK is redistributed in a bundle.
- **Request behavior:** SDK-owned Axios calls can renew an end-user session on a 401 and retry once. Raw `fetch`, SSE, and the existing socket handshake are not generally replayed by that HTTP interceptor. Browser tokens remain JavaScript-readable, so XSS protection still matters.

### Current repository integration state

- `package.json` and `pnpm-lock.yaml` now pin `@joorchin/client-sdk` **0.3.1**. The lockfile integrity was checked against the user-provided archive (`SHA-1 dde571728da126ea4a3f99b380127bd1f0519235`; pnpm SRI `sha1-3eVxco2hJupKP5mzgBJ70fBRkjU=`). The reference tarball remains untracked under `google_drive/` and is not part of the source changes.
- `src/lib/joorchinClient.js` configures the SDK with the app ID, direct API origin, app-scoped token key, and `client-sdk@0.3.1` identity. The token key is shared with the delivered auth helpers; rotated refresh pairs are mirrored to the legacy key. Session replacement/clear invalidates in-flight refreshes.
- Live standard auth calls (customer/staff OTP/password/recovery), profile reads/updates, visitor and staff plugin record/action calls, supported team and integration operations, entity calls where their query/response contracts match, and typed customer booking operations now use the SDK. Demo mode remains on the fetch-based simulator. Unsupported/custom routes retain the shared fetch adapter; in live mode it targets the direct API origin and performs one SDK-backed refresh/retry only when the caller's bearer matches the SDK session.
- Auth now follows the SDK's app-scoped route contract: OTP/password/recovery under `/apps/:appId/auth/...`, refresh at `/apps/:appId/auth/refresh`, profile at `/apps/:appId/users/me`, and logout at `/apps/:appId/auth/logout`. These paths were verified in the 0.3.1 package implementation/declarations, not against the live server.
- `Dockerfile.prod` accepts `VITE_JOORCHIN_SERVER_URL` (API origin, no `/api/v1`) and defaults the production API mode to live. Static Nginx still has no API proxy, so customer-hosted deployments require API CORS for the published site origin; unauthenticated SDK calls additionally require credentialed CORS with a non-wildcard allowed origin. `public/joorchin-sdk-license.txt` matches the archive's `LICENSE.md` byte-for-byte and was confirmed in the generated `dist/joorchin-sdk-license.txt` after the production build.
- The SDK README distinguishes customer-hosted apps (use `@joorchin/client-sdk`) from Joorchin-generated hosted apps (use delivered `@/api/*` modules and `@joorchin/site-ui`). This repository retains those generated-site facades but now delegates supported live contracts to the SDK and preserves custom adapters for routes the public SDK does not cover or whose semantics differ.
- SDK declarations and implementation prove only what the client expects. They do **not** prove that a live plugin is installed, a route exists in the deployed environment, CORS is configured, or server authorization/business logic is correct.

### Finding-by-finding assessment

| Finding | SDK surface | What is (and is not) established |
|---|---|---|
| 1. Production defaulted to demo | None needed | Fixed locally by production-defaulting to live. Verify the configured direct API origin, CORS, and app-scoped route availability. |
| 2. Forged demo/staff/Telegram auth | Customer and staff auth methods | Provides separate sign-in calls, but not JWT verification, membership validation, or Telegram `initData` signature verification. Server-side security remains unverified; SDK has no Telegram Mini App verifier. |
| 3. Cross-customer record access | Visitor plugin records/actions; booking and ecommerce routes | Client calls can be scoped to a caller token, but access-control checks are server responsibilities. No leak is proven fixed. |
| 4. Duplicate/stale/overlapping slots | Booking availability, generation, slot operations, book/reschedule | Route surface exists. SDK contains no slot dedupe, overlap lock, time-off invalidation, or schedule-rebuild algorithm. Live invariants need tests. |
| 5. Credit ownership/service/restore errors | `bookSlot` with `creditId`; my-credit, grant, and consume methods | The input and routes exist; the server must validate owner/service/expiry and restore at most once. No guarantee in the SDK. |
| 6. Event signup 403 | `bookEvent`, `listMyEvents`, event-registration cancellation | A visitor registration method/path is included; it does not prove the live route accepts the caller or creates the registration. |
| 7. Availability vs lead time | `listAvailability` and `bookSlot` | Both calls exist, but the SDK adds no matching lead-time filter. Server consistency must be verified. |
| 8. Guest carts share identity | Generic visitor plugin actions; no dedicated cart helper | The app's custom ecommerce wrapper owns `x-cart-session`; server isolation must bind cart ownership to the correct token/session. SDK adoption alone does not solve it. |
| 9. Self-approved reviews | Generic visitor plugin actions/records | No review-specific moderation method or policy. Server must ignore caller-supplied approval state and gate publication. |
| 10. Negative loyalty redemption | Generic visitor plugin actions | No loyalty-specific validation. Server must require a positive, valid redemption amount. |
| 11. Package success vs credit activation | Booking package-purchase calls; staff ecommerce fulfillment and booking-credit grant calls | The API can represent purchase, fulfillment, and manual credit grant, but the SDK does not guarantee automatic fulfillment or a payment-hook workflow. Verify backend automation and update the UI promise accordingly. |
| 12. Phone links/numbers | None | Frontend-only. Verify the clinic number and centralize Persian/Arabic digit normalization and `tel:` formatting. |

**Conclusion:** no backend fix to any of the 12 behavioral findings is verified from the SDK archive alone. The SDK exposes live routes for bookings/events/credits and staff ecommerce workflows, which gives the app a supported client surface; only live server tests or server implementation can establish whether those routes resolve the demo-only defects. The estimate that integration would resolve at least half remains unconfirmed.

## Validation limits and next checks

- Direct Node probes against `src/demo/engine.js` confirmed the demo behaviors summarized above.
- The SDK archive was inspected and its SHA-1 checked against the lockfile integrity. A normal frozen pnpm install could not complete: the private `@joorchin/site-ui@0.1.8` tarball is not available in the local store, and the earlier online fetch failed during the private GitLab TLS handshake.
- A production Vite build completed using the workspace's cached dependencies and the user-provided SDK archive. Because the private site-ui package was unavailable, the local validation setup used an ignored empty source directory for its Tailwind `@source` directive; `src/` has no runtime imports from that package. The build reports a 3.13 MB SDK chunk warning and omits `sitemap.xml` when `VITE_SITE_URL` is unset; neither warning fails the build.
- `node node_modules/eslint/bin/eslint.js src`, `node node_modules/tsrs/bin/tsrs --noEmit -p jsconfig.json`, and `git diff --check` passed.
- The checked-in Node tests failed before execution because Node does not support their `bun:` imports. `package.json` has no `test` script.
- No live Joorchin backend, deployed route, CORS policy, or server-side plugin implementation was inspected. App-scoped route compatibility is confirmed against SDK 0.3.1 only. Live auth, access-control, slot concurrency, credits, event registration, cart isolation, review moderation, loyalty validation, and package fulfillment remain unverified.
