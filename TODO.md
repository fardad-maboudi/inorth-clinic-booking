# Gallery showcase: Clinic / salon booking and membership site

Status: not started. Target folder: `gallery/clinic-booking` (the `gallery/` folder does not exist yet; confirm the path).

Why this site: it shows what the ecommerce showcase does not. Time-slot engine with concurrency, staff and resources, session packages and credits, loyalty, Telegram reminders and Mini App booking, passkey login, support desk and a POS for walk-ins. It reuses ecommerce only for selling packages and gift cards.

## 1. What a top professional would do that was not asked

- Treat the app as a frozen, importable bundle that must round-trip: export with no data, import into a fresh app, same routes working, no hardcoded app IDs.
- Prove the hard parts, not the screens: double-booking under concurrent requests, reschedule and cancel policy windows, credit deduction and refund, timezone and holiday handling.
- Make the admin an operations tool a receptionist could run all day: day calendar per staff, no-show handling, client CRM, package sales, broadcast to clients.
- Check Persian/RTL (Jalali dates, Persian digits), mobile width, and empty, error and loading states on every screen.

## 2. Rawest material to start from

- Plugin contracts and routes: `be/core/src/modules/plugins/bookings/` (README, `availability.ts`, `booking-reservation.service.ts`, `booking-rescheduling.service.ts`, `booking-loyalty.service.ts`, `booking-packages.routes.ts`, `booking-default-settings.ts`) and its `scaffold/`.
- `be/core/src/modules/plugins/telegram/` (event catalog, `miniapp/`, notification delivery), `notifications/`, `support-desk/`, `passkeys/`, `pos/`, `delivery/` is not needed.
- Bookings tests as the behavior spec: `bookings-concurrency.test.ts`, `bookings-credit.test.ts`, `bookings-events.test.ts`, `booking-schedule-slot-generation.test.ts`.
- `be/vps/generated-site` plus the ownership lists in `sdks/contracts/schemas/platform-files.ts`.
- Bundle format: `be/core/src/modules/app-portability/` (`app-bundle-export.use-case.ts`, `app-bundle-archive.use-case.ts`, `APP_BUNDLE_VERSION`).
- `docs/GALLERY.md` (showcases are frozen bundles published via `/admin/templates`), `docs/SITE_SDK_SURFACES.md`, `docs/AUTH.md`, `docs/TELEGRAM.MD`, `sdks/README.md`.
- Not an existing generated site and not doc summaries.

## 3. Methods and tools

- Start from the generated-site scaffold; install bookings, telegram, notifications, support-desk, passkeys, pos and loyalty through the real plugin install path. Sell packages and gift cards through the ecommerce routes, never by custom money code.
- Visitor pages use `@/api/plugins/bookings` only. The admin uses the back-office SDK surface (`@/api/backoffice/bookings`) and is gated with `requireSiteAdmin`. Visitor pages never import the back-office SDK.
- Telegram: bot spec plus a Mini App second entry for booking, following the `telegram-app-builder` skill rules. Reminders go through the notification and Telegram delivery paths.
- Seed realistic data (3 services, 4 staff, weekly hours, a holiday, 2 packages) through seed packs, not hand-written rows in the bundle.
- Export with `includeData: false`. Bump versions only through `bun run checks`; generated-site changes also bump `IMAGE_VERSION`.
- Local stack (`make up`) and the `kimi-webbridge` skill for rendered-route evidence.

## 4. What other than the author shows it is right

- Export then import into a fresh app: same routes work, no tenant rows leaked.
- Repo tests: bundle and scaffold contract tests, bookings concurrency and credit suites, `bun run checks`.
- A concurrency script: N parallel requests for one slot produce exactly one booking.
- Rendered screenshots (RTL, desktop and mobile) of home, service picker, slot picker, checkout of a package, client account, admin calendar, admin client CRM, Telegram Mini App.
- A test-mode flow driven end to end: book, pay for a package, receive the Telegram reminder, reschedule, cancel, see credit restored, with rows verified in the database.

## Rewritten prompt

> Build a full-featured Persian/RTL clinic and salon booking and membership site as a frozen, importable Joorchin template bundle at `gallery/clinic-booking`.
>
> - **Base:** start from `be/vps/generated-site`; honor `platform-files.ts` ownership and do not edit platform-owned files.
> - **Plugins:** install through the real plugin path: bookings (services, staff and resources, weekly schedules, holidays, packages and credits, loyalty, events and classes, Google Meet), telegram (reminders, Mini App booking, subscribe), notifications, support-desk, passkeys and pos. Sell packages and gift cards via ecommerce routes.
> - **Site:** services, staff profiles, slot picker with Jalali dates, guest and member booking, client account (upcoming, history, credits, reschedule, cancel), blog or FAQ, reviews.
> - **Admin:** back-office SDK, `requireSiteAdmin`. Dashboard, per-staff day calendar, appointments queue with no-show handling, client CRM, services and schedules, packages and credits, loyalty, support inbox, POS for walk-ins, Telegram broadcast, settings.
> - **Bundle:** export with no data; it must import cleanly into a fresh app and work on production, with correct version and `IMAGE_VERSION` bumps.
> - **Evidence:** export/import round-trip, passing bundle, scaffold and bookings tests, a parallel-booking concurrency check, rendered RTL screenshots at desktop and mobile width, and a test-mode flow driven end to end. Do not claim UI acceptance without rendered routes.
