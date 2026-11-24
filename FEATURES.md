# Feature coverage

Legend: **V** verified by driving the rendered UI on the demo API (screenshots in `evidence/`),
**T** verified by an automated test, **P** present but not exercised, **G** gap.
Demo API = `app/src/demo/` (an in-browser stand-in for the Joorchin platform; see README).

| Feature | Where | Status |
|---|---|---|
| Services (list, detail, price, duration) | `/services`, `/services/:id`; `/panel/services` CRUD | V |
| Staff / resources | `/team`, `/team/:id` (profile + next free slots); `/panel/services` staff tab | V |
| Weekly schedules | `/panel/services` hours editor (saved, survives reload); slots generated from hours | V, T |
| Holidays / time-off | `/panel/services` time-off tab; Nowruz closure seeded | V, T (no slot overlaps closure) |
| Slot picker, Jalali dates, Persian digits | `/book`, home hero card, service/staff pages | V |
| Guest booking | `/book` (session-scoped) | V, T |
| Member booking (OTP login) | `/auth/login`, `/book`, `/client` | V |
| Reschedule / cancel with policy windows | `/client`, Mini App, `/panel/appointments` | V, T (24 h lock, late cancel refused for clients) |
| Parallel booking = one booking per slot | engine `claimSlot` | T (40 parallel -> 1 booking, 39 x 409) |
| Packages and gift card | `/packages` (ecommerce products, checkout) | V (order created, test-mode paid); G: no real gateway |
| Package fulfilment -> credits | `/panel/packages` paid orders -> `grantCredit` | T (order -> grant -> client sees credit); P in UI after the engine gained orders |
| Credits: consume, restore on cancel | booking with credit; `/client` credits tab | V, T |
| Loyalty | `/client` loyalty tab (tier, ledger); `/panel/loyalty` | V (client); P (staff adjust added to engine after the UI pass) |
| Events / classes | `/panel/events` create, registrations drawer, cancel | V (create); P (cancel, registrations: engine added after the UI pass). G: no authored public events page; the platform scaffold route `/bookings/events` remains |
| Client account | `/client` upcoming, history, credits, loyalty, profile | V |
| Reviews | home + service pages (reviews plugin) | V (render) |
| FAQ, contact | `/faq`, `/contact` | V |
| Telegram Mini App booking | `app/src/miniapp/**` (services, specialist, slots, confirm, my bookings, credits, reminders, owner view) | V at 390x844 through `telegram/dev-harness.js`; G: not run inside real Telegram |
| Telegram reminders | `telegram/bot-spec.json`, `notification-rules.json` (24 h and 2 h offsets) | P; G: no `booking.reminder` catalog event, needs rule rows + a bot token, delivery unverified |
| Telegram broadcast | `/panel/broadcast` | V (demo); delivery needs a bot token |
| Notifications | bell + inbox (platform scaffold), reminder rules | P |
| Support desk | `/support/tickets` (platform scaffold); `/panel/support` inbox + reply | V (panel), P (visitor pages) |
| Passkey sign-in | login page extension component | P (WebAuthn needs a real origin and server) |
| Walk-in POS | `/panel/pos` -> `createWalkIn`, receipt, today's walk-ins | V |
| Admin: dashboard, per-staff day calendar, queue, no-show, client CRM, settings | `/panel/*` | V |
| Admin gate | every `/panel` page checks `getMyMembership` / `booking:manage` | V |
| RTL, mobile, states, motion | every screen; reduced motion honoured | V (screenshots at 1440 and 390); motion captured under reduced-motion emulation, not seen playing |

Notes

- The `pos` module in `be/core/src/modules/plugins/pos` is the platform's POS-licence product and is not an installable site plugin; the walk-in POS here is the bookings back-office walk-in.
- Platform-path defects found while building (fixed in the monorepo worktree, not part of this app): `booking_credit` and `booking_event_registration` were never registered in `BOOKINGS_MODELS`, so package credits and event registrations failed on real Mongo; staff `grantCredit` did not copy the client's account onto the credit; `POST services/:id/package/purchase` mints credits with no payment and no owner link (not used here).
