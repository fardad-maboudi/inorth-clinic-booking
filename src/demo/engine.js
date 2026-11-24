/**
 * In-memory stand-in for the Joorchin platform API, used by the demo build.
 *
 * The site always talks to the platform through the SDK (`@/api/...`) which
 * issues `fetch('/api/v1/apps/<id>/...')`. `install.js` routes those calls here
 * when no live backend is configured. The rules below mirror the real bookings
 * plugin so the UI is exercised against the same contracts:
 *   - a slot has `capacityTotal` seats; booking claims a seat atomically
 *     (`claimSlot` is synchronous, so N parallel requests yield exactly one
 *     booking for a one-seat slot, the rest get 409);
 *   - cancel/reschedule are free until `cancellationWindowHours` before the
 *     start; a credit-backed booking restores its credit on a timely cancel;
 *   - credits are visible to the client only when linked to the site account.
 * Swapping to production means deleting `src/demo/` (or setting
 * `VITE_API_MODE=live`); no page imports this module.
 */
import {
  DEMO_CLIENTS, DEMO_MEMBER_PHONE, FAQ, PRODUCTS, REVIEWS, SERVICES, STAFF, STAFF_PHONE, TIMEOFF,
} from './seed-data.js';

const STORE_KEY = 'clinic-demo-store-v2';
const TEHRAN_OFFSET_MIN = 210; // Iran has no DST since 2022
const HOUR = 3_600_000;
const DAY = 86_400_000;
let seq = 0x6a000000;
const newId = () => (++seq).toString(16).padStart(8, '0') + Math.random().toString(16).slice(2, 18).padEnd(16, '0');
const nowIso = () => new Date().toISOString();
const clone = (v) => JSON.parse(JSON.stringify(v));

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code ?? (status === 409 ? 'CONFLICT' : status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : status === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST');
  }
}

/* ------------------------------ time helpers ------------------------------ */
const tehranParts = (ms) => {
  const d = new Date(ms + TEHRAN_OFFSET_MIN * 60_000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay() };
};
const tehranToUtc = (y, m, d, hh, mm) => Date.UTC(y, m, d, hh, mm) - TEHRAN_OFFSET_MIN * 60_000;
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/* -------------------------------- store ----------------------------------- */
let db;
function emptyDb() {
  return { services: [], resources: [], schedules: [], timeoff: [], slots: [], bookings: [], clients: [], credits: [], events: [], registrations: [], settings: [], faq: [], products: [], orders: [], carts: {}, reviews: [], tickets: [], notifications: [], loyalty: [], broadcasts: [], telegram: { connected: false, subscribers: 128 }, users: [] };
}
const meta = (extra) => ({ app_id: 'demo', created_at: nowIso(), updated_at: nowIso(), deleted_at: null, ...extra });

function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch { /* quota/private mode: demo state stays in memory */ }
}

export function resetDemo() {
  db = emptyDb();
  const staffIds = {};
  for (const s of STAFF) {
    const r = meta({ _id: newId(), name: s.name, kind: 'staff', title: s.title, bio: s.bio, color: s.color, capacity: 1, active: true, sortOrder: db.resources.length });
    db.resources.push(r);
    staffIds[s.key] = r._id;
    for (const h of s.hours) db.schedules.push(meta({ _id: newId(), resource: r._id, weekday: h.weekday, startTime: h.startTime, endTime: h.endTime, slotIntervalMinutes: 30, active: true }));
  }
  const svcIds = {};
  SERVICES.forEach((s, i) => {
    const row = meta({ _id: newId(), name: s.name, group: s.group, description: s.description, kind: 'solo', mode: 'in_person', currency: 'IRR', durationMinutes: s.durationMinutes, bufferBeforeMinutes: 0, bufferAfterMinutes: s.bufferAfterMinutes, capacity: 1, price: s.price, depositAmount: 0, autoConfirm: true, resourceIds: s.staff.map((k) => staffIds[k]), color: s.color, active: true, sortOrder: i, ...(s.package ? { package: { ...s.package, unlimited: false, schedulingMode: 'self_schedule' } } : {}) });
    db.services.push(row);
    svcIds[s.key] = row._id;
  });
  for (const t of TIMEOFF) db.timeoff.push(meta({ _id: newId(), ...t }));
  db.settings.push(meta({ _id: newId(), timezone: 'Asia/Tehran', weekStartsOn: 6, leadTimeMinutes: 60, horizonDays: 21, slotIntervalMinutes: 30, cancellationWindowHours: 24, rescheduleWindowHours: 24, noShowFeeAmount: 0, allowGuestBooking: true, requirePhone: true, autoConfirm: true, depositRequired: false, maxActivePerClient: 3, reminderOffsetsMinutes: [-1440, -120], cancellationPolicyText: 'لغو نوبت تا ۲۴ ساعت قبل از موعد بدون جریمه امکان‌پذیر است.', workingHoursNote: 'شنبه تا چهارشنبه ۱۰:۰۰ تا ۱۹:۰۰ — پنج‌شنبه‌ها ۱۰:۰۰ تا ۱۵:۰۰' }));
  FAQ.forEach((f, i) => db.faq.push(meta({ _id: newId(), ...f, active: true, sortOrder: i })));
  PRODUCTS.forEach((p, i) => db.products.push(meta({ _id: newId(), ...p, goodsKind: 'digital', currency: 'IRT', stock: 1000, active: true, order: i })));
  REVIEWS.forEach((r) => db.reviews.push(meta({ _id: newId(), targetId: 'clinic', status: 'approved', ...r, createdAt: nowIso() })));
  DEMO_CLIENTS.forEach((c) => db.clients.push(meta({ _id: newId(), ...c, clientUserId: c.phoneNumber === DEMO_MEMBER_PHONE ? 'user-demo-member' : undefined })));
  db.users.push({ userId: 'user-demo-member', phoneNumber: DEMO_MEMBER_PHONE, fullName: 'سارا مرادی', role: 'user' });
  generateSlots(21);
  seedActivity(svcIds);
  db.notifications.push({ _id: newId(), user: 'user-demo-member', title: 'نوبت شما تأیید شد', body: 'نوبت شما با موفقیت ثبت و تأیید شد.', read: false, created_at: nowIso() });
  persist();
}

function generateSlots(daysAhead) {
  const today = tehranParts(Date.now());
  for (let i = 0; i < daysAhead; i++) {
    const day = tehranParts(tehranToUtc(today.y, today.m, today.d + i, 12, 0));
    for (const svc of db.services) {
      for (const resId of svc.resourceIds) {
        for (const sch of db.schedules.filter((x) => x.resource === resId && x.weekday === day.wd && x.active)) {
          const step = svc.durationMinutes + svc.bufferAfterMinutes;
          for (let t = toMin(sch.startTime); t + svc.durationMinutes <= toMin(sch.endTime); t += step) {
            const startsAt = tehranToUtc(day.y, day.m, day.d, Math.floor(t / 60), t % 60);
            const endsAt = startsAt + svc.durationMinutes * 60_000;
            if (isClosed(resId, startsAt, endsAt)) continue;
            db.slots.push(meta({ _id: newId(), startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(), capacity: svc.capacity, capacityTotal: svc.capacity, available: true, service: svc._id, resource: resId, title: svc.name, price: svc.price, mode: 'in_person', meetingStatus: 'none' }));
          }
        }
      }
    }
  }
}

function isClosed(resId, a, b) {
  return db.timeoff.some((t) => (!t.resource || t.resource === resId) && new Date(t.startsAt).getTime() < b && new Date(t.endsAt).getTime() > a);
}

/** A believable week: some pending/confirmed upcoming, a few past with outcomes. */
function seedActivity(svcIds) {
  const upcoming = db.slots.filter((s) => new Date(s.startsAt).getTime() > Date.now() + 2 * HOUR);
  let pick = 3;
  const names = db.clients;
  let n = 0;
  for (let i = 0; i < upcoming.length && n < 22; i += pick, pick = (pick % 5) + 3) {
    const slot = upcoming[i];
    // The demo member keeps a single upcoming visit so the booking flow stays open to them.
    const client = names[n % names.length].clientUserId && n >= names.length ? names[(n + 1) % names.length] : names[n % names.length];
    createBooking(slot, { customerName: client.fullName, customerPhone: client.phoneNumber }, { clientId: client._id, userId: client.clientUserId, status: n % 4 === 0 ? 'pending' : 'confirmed' });
    n++;
  }
  const past = [
    ['completed', 1], ['completed', 2], ['no_show', 2], ['completed', 3], ['cancelled', 3], ['completed', 5], ['no_show', 6], ['completed', 7],
  ];
  past.forEach(([status, daysAgo], i) => {
    const svc = db.services[i % db.services.length];
    const resId = svc.resourceIds[0];
    const client = names[i % names.length];
    const start = Date.now() - daysAgo * DAY - (i % 3) * HOUR;
    db.bookings.push(meta({ _id: newId(), type: 'service', source: 'web', slotId: null, status, startsAt: new Date(start).toISOString(), endsAt: new Date(start + svc.durationMinutes * 60_000).toISOString(), service: svc._id, resource: resId, client: client._id, customerName: client.fullName, customerPhone: client.phoneNumber, seats: 1, price: svc.price, totalPrice: svc.price, paymentStatus: status === 'completed' ? 'paid' : 'unpaid', user: client.clientUserId }));
  });
  const member = db.clients.find((c) => c.phoneNumber === DEMO_MEMBER_PHONE);
  db.credits.push(meta({ _id: newId(), client: member._id, user: 'user-demo-member', serviceIds: [svcIds.skin], totalSessions: 4, remainingSessions: 3, status: 'active', expiresAt: new Date(Date.now() + 70 * DAY).toISOString(), grantReason: 'بسته ۴ جلسه‌ای پوست', sourceType: 'service', unlimited: false }));
  db.loyalty.push({ _id: newId(), user: 'user-demo-member', points: 1280, tier: 'silver', lifetimeSpend: 18_000_000, giftCardBalance: 0 });
  db.tickets.push(
    { _id: newId(), subject: 'امکان تغییر ساعت نوبت لیزر؟', status: 'open', user: 'user-demo-member', customerName: 'سارا مرادی', created_at: new Date(Date.now() - 5 * HOUR).toISOString(), replies: [{ _id: newId(), author: 'customer', body: 'سلام، می‌خواستم نوبت لیزر را یک روز جلو بیندازم.', created_at: new Date(Date.now() - 5 * HOUR).toISOString() }] },
    { _id: newId(), subject: 'سوال درباره بسته ۶ جلسه‌ای', status: 'answered', customerName: 'مریم حسینی', created_at: new Date(Date.now() - 30 * HOUR).toISOString(), replies: [{ _id: newId(), author: 'customer', body: 'بسته شامل چه نواحی‌ای می‌شود؟', created_at: new Date(Date.now() - 30 * HOUR).toISOString() }, { _id: newId(), author: 'staff', body: 'یک ناحیه به انتخاب شما در هر جلسه.', created_at: new Date(Date.now() - 28 * HOUR).toISOString() }] },
  );
}

/* ------------------------------ booking rules ----------------------------- */
const settings = () => db.settings[0];
const byId = (list, id) => list.find((x) => x._id === id);
const normPhone = (p) => {
  const d = String(p ?? '').replace(/[^\d+]/g, '').replace(/^\+98/, '0').replace(/^0098/, '0').replace(/^98/, '0');
  return /^09\d{9}$/.test(d) ? `+98${d.slice(1)}` : String(p ?? '');
};

/** Atomic seat claim. Synchronous: no interleaving between check and decrement. */
export function claimSlot(slot, seats = 1) {
  if (!slot.available || slot.capacity < seats) throw new ApiError(409, 'این زمان دیگر خالی نیست', 'SLOT_FULL');
  slot.capacity -= seats;
  if (slot.capacity <= 0) slot.available = false;
}
function releaseSlot(slot, seats = 1) {
  slot.capacity = Math.min(slot.capacityTotal, slot.capacity + seats);
  if (slot.capacity > 0) slot.available = true;
}

function createBooking(slot, body, opts = {}) {
  claimSlot(slot, body.seats ?? 1);
  const svc = byId(db.services, slot.service);
  const status = opts.status ?? (svc?.autoConfirm ? 'confirmed' : 'pending');
  const phone = normPhone(body.customerPhone);
  let client = opts.clientId ? byId(db.clients, opts.clientId) : db.clients.find((c) => c.phoneNumber === phone);
  if (!client) {
    client = meta({ _id: newId(), fullName: body.customerName, phoneNumber: phone, visitCount: 0, noShowCount: 0, clientUserId: opts.userId });
    db.clients.push(client);
  } else if (client.blockedAt) {
    releaseSlot(slot);
    throw new ApiError(403, 'این شماره تماس مسدود شده است');
  }
  const row = meta({ _id: newId(), type: 'service', source: opts.source ?? 'web', mode: 'in_person', meetingStatus: 'none', slotId: slot._id, status, startsAt: slot.startsAt, endsAt: slot.endsAt, service: slot.service, resource: slot.resource, client: client._id, customerName: body.customerName, customerPhone: phone, notes: body.notes, seats: body.seats ?? 1, price: slot.price, totalPrice: slot.price, paymentStatus: 'unpaid', ...(status === 'confirmed' ? { confirmedAt: nowIso() } : {}), ...(opts.userId ? { user: opts.userId } : {}), ...(body.creditId ? { creditId: body.creditId } : {}) });
  db.bookings.push(row);
  return row;
}

function consumeCreditRow(creditId, who) {
  const credit = byId(db.credits, creditId);
  if (!credit || (who.userId && credit.user !== who.userId)) throw new ApiError(404, 'اعتبار پیدا نشد');
  if (credit.remainingSessions < 1 || credit.status !== 'active') throw new ApiError(409, 'اعتباری برای این بسته باقی نمانده است');
  if (credit.expiresAt && new Date(credit.expiresAt) < new Date()) throw new ApiError(409, 'اعتبار این بسته منقضی شده است');
  credit.remainingSessions -= 1;
  if (credit.remainingSessions === 0) credit.status = 'used';
  return credit;
}
function restoreCredit(booking) {
  const credit = booking.creditId && byId(db.credits, booking.creditId);
  if (credit) { credit.remainingSessions += 1; credit.status = 'active'; }
}
const hoursUntil = (iso) => (new Date(iso).getTime() - Date.now()) / HOUR;

function mine(who) {
  return db.bookings.filter((b) => (who.userId && b.user === who.userId) || (who.sessionId && b.session === who.sessionId));
}
function assertOwnsOrStaff(booking, who) {
  if (who.staff) return;
  if (!(who.userId && booking.user === who.userId) && !(who.sessionId && booking.session === who.sessionId)) throw new ApiError(404, 'رزرو پیدا نشد');
}

/* --------------------------------- routes --------------------------------- */
const ok = (body, status = 200) => ({ status, body });
const page = (rows, q) => {
  let out = rows;
  if (q.filter) {
    try {
      const f = JSON.parse(q.filter);
      out = out.filter((r) => Object.entries(f).every(([k, v]) => (v && typeof v === 'object' ? true : r[k] === v)));
    } catch { /* ignore malformed filter */ }
  }
  if (q.sort) {
    const key = q.sort.replace(/^-/, '');
    const dir = q.sort.startsWith('-') ? -1 : 1;
    out = [...out].sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
  }
  const skip = Number(q.skip ?? 0);
  const limit = Number(q.limit ?? 200);
  return out.slice(skip, skip + limit);
};
const COLLECTIONS = {
  bookings: { booking_service: 'services', booking_resource: 'resources', booking_schedule: 'schedules', booking_timeoff: 'timeoff', booking_client: 'clients', booking: 'bookings', booking_setting: 'settings', booking_event: 'events', booking_credit: 'credits', slot: 'slots' },
  'faq-kb': { faq: 'faq' },
  ecommerce: { product: 'products' },
  'loyalty-club': { loyalty_member: 'loyalty', loyalty_ledger: 'loyalty_ledger' },
};

function signToken(payload) {
  const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'none' })}.${b64(payload)}.demo`;
}
function readToken(header) {
  const token = String(header ?? '').replace(/^Bearer\s+/i, '');
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return null; }
}

export function sessionFor(phone, staff, appId) {
  const p = normPhone(phone);
  let user = db.users.find((u) => u.phoneNumber === p);
  if (!user) { user = { userId: `user-${p.slice(-4)}-${db.users.length}`, phoneNumber: p, fullName: '', role: 'user' }; db.users.push(user); }
  const isStaff = staff && p === STAFF_PHONE;
  if (staff && !isStaff) throw new ApiError(403, 'این شماره دسترسی مدیریت ندارد');
  const capabilities = isStaff ? ['booking:manage', 'booking:use', 'customer:read', 'customer:write', 'order:read', 'order:confirm', 'comms:broadcast', 'team:read', 'product:read', 'app:read'] : ['booking:use', 'cart:use', 'checkout:use', 'order:read:own', 'review:write'];
  const claims = { sub: isStaff ? 'staff-1' : user.userId, phoneNumber: p, role: isStaff ? 'admin' : 'user', appId, tokenKind: isStaff ? 'site_admin' : 'site_user', exp: Math.floor(Date.now() / 1000) + 86_400 };
  return { token: signToken(claims), refreshToken: signToken({ ...claims, refresh: true }), user: { userId: claims.sub, phoneNumber: p, fullName: user.fullName, role: claims.role, appId, isSiteOwner: isStaff, phoneVerified: true, isActive: true, hasPassword: false }, capabilities, tokenKind: claims.tokenKind };
}

/**
 * Handle one platform call. `path` is relative to `/api/v1/apps/<id>`.
 * `ctx` = { method, query, body, headers }.
 */
export function handle(appId, method, path, ctx) {
  if (!db) load();
  const claims = readToken(ctx.headers.authorization);
  const staff = claims?.tokenKind === 'site_admin';
  const user = claims && !claims.refresh ? db.users.find((u) => u.userId === claims.sub) : undefined;
  const who = { staff, userId: claims?.sub === 'staff-1' ? undefined : claims?.sub, sessionId: ctx.headers['x-booking-session'] };
  const q = ctx.query;
  const body = ctx.body ?? {};
  const seg = path.split('/').filter(Boolean);
  const need = (cond) => { if (!cond) throw new ApiError(claims ? 403 : 401, claims ? 'دسترسی کافی ندارید' : 'برای ادامه وارد شوید'); };

  /* auth */
  if (seg[0] === 'auth') {
    const adminFlow = seg[1] === 'admin';
    const step = adminFlow ? seg[2] : seg[1];
    if (step === 'initiate') return ok({ status: db.users.some((u) => u.phoneNumber === normPhone(body.phoneNumber)) ? 'login_options' : 'signup_required', message: 'کد تأیید ارسال شد (حالت نمایشی: هر کد معتبر است)', appId, retryAfterSec: 30 });
    if (step === 'verify-otp') {
      const s = sessionFor(body.phoneNumber, adminFlow, appId);
      persist();
      return ok({ status: 'success', success: true, message: 'ورود موفق', token: s.token, refreshToken: s.refreshToken, user: s.user, session: { tokenKind: s.tokenKind, capabilities: s.capabilities } });
    }
    if (step === 'me') { need(claims); return ok({ userId: claims.sub, fullName: user?.fullName ?? '', tokenKind: claims.tokenKind ?? 'preview', appId }); }
    if (step === 'refresh') return ok({ success: true, token: ctx.body?.refreshToken ?? '', refreshToken: ctx.body?.refreshToken ?? '' });
    if (step === 'logout') return ok({ success: true });
  }
  if (path === 'users/me') { need(claims); return ok({ ...(user ?? { userId: claims.sub, phoneNumber: claims.phoneNumber, role: claims.role }), appId, tokenKind: claims.tokenKind, capabilities: staff ? ['booking:manage', 'booking:use'] : ['booking:use', 'cart:use', 'checkout:use', 'review:write'] }); }
  if (path === 'members/me') { need(staff); return ok({ success: true, data: { appId, userId: 'staff-1', tokenKind: 'site_admin', isOwner: true, capabilities: ['access:manage', 'analytics:read', 'app:read', 'booking:manage', 'booking:use', 'comms:broadcast', 'customer:read', 'customer:write', 'order:read', 'order:confirm', 'product:read', 'product:write', 'team:read', 'team:manage'], ownedRowsOnly: false } }); }
  if (path === 'telemetry') return { status: 204, body: null };
  if (path === 'site-settings/public' || path.startsWith('plugins/trust-seals')) return ok({});

  if (seg[0] !== 'plugins') throw new ApiError(404, `Route not found: ${method} ${path}`);
  const plugin = seg[1];
  const rest = seg.slice(2);

  /* generic plugin data collections */
  if (rest[0] === 'data' && COLLECTIONS[plugin]?.[rest[1]]) {
    const key = COLLECTIONS[plugin][rest[1]];
    const coll = db[key] ?? (db[key] = []);
    const id = rest[2];
    if (method === 'GET' && !id) {
      if (['clients', 'bookings', 'credits', 'schedules', 'timeoff', 'settings', 'resources'].includes(key) && rest[1] !== 'booking_resource') need(staff || key === 'settings');
      if (key === 'loyalty') return ok(coll.filter((r) => staff || r.user === who.userId));
      return ok(page(coll, q));
    }
    if (method === 'GET') { const row = byId(coll, id); if (!row) throw new ApiError(404, 'پیدا نشد'); return ok(row); }
    need(staff);
    if (method === 'POST') { const row = meta({ _id: newId(), ...body }); coll.push(row); persist(); return ok(row, 201); }
    if (method === 'PUT' || method === 'PATCH') { const row = byId(coll, id); if (!row) throw new ApiError(404, 'پیدا نشد'); Object.assign(row, body, { updated_at: nowIso() }); persist(); return ok(row); }
    if (method === 'DELETE') { const i = coll.findIndex((r) => r._id === id); if (i >= 0) coll.splice(i, 1); persist(); return ok({ success: true }); }
  }

  if (plugin === 'bookings') return bookings(method, rest, { q, body, who, staff, need, user });
  if (plugin === 'notifications') {
    if (rest[0] === 'unread-count') return ok({ count: db.notifications.filter((n) => n.user === who.userId && !n.read).length });
    if (rest[0] === 'my') { const rows = db.notifications.filter((n) => n.user === who.userId); return ok({ data: rows, meta: { unread: rows.filter((n) => !n.read).length, total: rows.length } }); }
    return ok({ success: true });
  }
  if (plugin === 'ecommerce') return ecommerce(method, rest, { q, body, who, staff, claims, need });
  if (plugin === 'reviews') {
    if (rest[0] === 'summary') { const r = db.reviews; return ok({ average: +(r.reduce((a, x) => a + x.rating, 0) / (r.length || 1)).toFixed(1), count: r.length }); }
    if (rest[0] === 'reviews' && method === 'GET') return ok({ items: db.reviews.filter((r) => r.status === 'approved'), total: db.reviews.length });
    if (rest[0] === 'reviews' && method === 'POST') { need(claims); const row = meta({ _id: newId(), status: 'pending', ...body }); db.reviews.push(row); persist(); return ok(row, 201); }
    return ok({ items: [] });
  }
  if (plugin === 'loyalty-club') {
    if (rest[0] === 'me') { need(claims); const m = db.loyalty.find((l) => l.user === who.userId) ?? { points: 0, tier: 'bronze', lifetimeSpend: 0, giftCardBalance: 0 }; return ok({ ...m, nextTier: 'gold', pointsToNextTier: Math.max(0, 3000 - m.points), ledger: [{ _id: 'l1', kind: 'earn', points: 480, note: 'ویزیت پوست', created_at: new Date(Date.now() - 9 * DAY).toISOString() }, { _id: 'l2', kind: 'earn', points: 800, note: 'بسته ۴ جلسه‌ای', created_at: new Date(Date.now() - 20 * DAY).toISOString() }] }); }
    if (rest[0] === 'adjust' || rest[0] === 'members') {
      need(staff);
      const uid = body.userId ?? body.user ?? rest[1];
      const m = db.loyalty.find((l) => l.user === uid) ?? (db.loyalty.push({ _id: newId(), user: uid, points: 0, tier: 'bronze', lifetimeSpend: 0, giftCardBalance: 0 }), db.loyalty.at(-1));
      m.points = Math.max(0, m.points + Number(body.points ?? body.amount ?? body.delta ?? 0));
      m.tier = m.points >= 3000 ? 'gold' : m.points >= 1000 ? 'silver' : 'bronze';
      persist();
      return ok({ success: true, member: m, points: m.points });
    }
    if (rest[0] === 'redeem') { need(claims); const m = db.loyalty.find((l) => l.user === who.userId); if (!m || m.points < body.points) throw new ApiError(409, 'امتیاز کافی نیست'); m.points -= body.points; persist(); return ok({ success: true, points: m.points }); }
    return ok({});
  }
  if (plugin === 'support-desk') {
    need(claims);
    if (rest[0] === 'tickets' && !rest[1]) {
      if (method === 'POST') { const row = { _id: newId(), subject: body.subject, status: 'open', user: who.userId, customerName: user?.fullName || 'مشتری', created_at: nowIso(), replies: [{ _id: newId(), author: 'customer', body: body.body, created_at: nowIso() }] }; db.tickets.unshift(row); persist(); return ok(row, 201); }
      const rows = staff ? db.tickets : db.tickets.filter((t) => t.user === who.userId);
      return ok({ data: rows, meta: { total: rows.length } });
    }
    const t = byId(db.tickets, rest[1]);
    if (!t) throw new ApiError(404, 'تیکت پیدا نشد');
    if (rest[2] === 'replies') { t.replies.push({ _id: newId(), author: staff ? 'staff' : 'customer', body: body.body, created_at: nowIso() }); t.status = staff ? 'answered' : 'open'; persist(); return ok(t, 201); }
    if (rest[2] === 'close') { t.status = 'closed'; persist(); return ok(t); }
    return ok(t);
  }
  if (plugin === 'telegram') {
    if (rest[0] === 'miniapp' && (rest[1] === 'auth' || rest[1] === 'session')) {
      const owner = rest[1] === 'auth' ? /staff=1|owner=1/.test(String(body.initData ?? '')) : staff;
      const sess = sessionFor(owner ? STAFF_PHONE : DEMO_MEMBER_PHONE, owner, appId);
      return ok({ token: sess.token, user: sess.user, actor: owner ? 'owner' : 'user', capabilities: sess.capabilities });
    }
    if (rest[0] === 'setup' || rest[0] === 'status') return ok({ botUsername: 'neelofar_clinic_bot', connected: true, subscribers: db.telegram.subscribers, users: db.telegram.subscribers, admins: 2, notificationsEnabled: true });
    if (rest[0] === 'broadcast') { need(staff); const row = { _id: newId(), message: body.message ?? body.text, audience: body.audience ?? 'all', sentAt: nowIso(), delivered: db.telegram.subscribers }; db.broadcasts.unshift(row); persist(); return ok({ success: true, queued: db.telegram.subscribers, broadcast: row }, 202); }
    if (rest[0] === 'notification-status' || rest[0] === 'event-catalog') return ok({ items: [] });
    return ok({ success: true });
  }
  return ok({});
}

function ecommerce(method, rest, { body, who, staff, claims, need }) {
  const key = who.userId ?? who.sessionId ?? 'anon';
  const cart = (db.carts[key] ??= { id: key, items: [], currency: 'IRT' });
  const view = () => {
    const subtotal = cart.items.reduce((a, i) => a + i.price * i.qty, 0);
    return { id: cart.items.length ? cart.id : '', items: cart.items, subtotal, discount: 0, tax: 0, shippingCost: 0, total: subtotal, currency: 'IRT' };
  };
  if (rest[0] === 'cart') {
    if (rest[1] === 'items' && method === 'POST') {
      const p = byId(db.products, body.productId);
      if (!p) throw new ApiError(404, 'محصول پیدا نشد');
      const line = cart.items.find((i) => i.productId === p._id);
      if (line) line.qty += body.qty ?? 1;
      else cart.items.push({ id: p._id, lineId: p._id, productId: p._id, title: p.title, price: p.price, qty: body.qty ?? 1 });
      persist();
      return ok(view());
    }
    if (rest[1] === 'items' && rest[2] && method === 'PUT') { const line = cart.items.find((i) => i.lineId === rest[2]); if (line) line.qty = Math.max(1, body.qty ?? 1); persist(); return ok(view()); }
    if (rest[1] === 'items' && rest[2] && method === 'DELETE') { cart.items = cart.items.filter((i) => i.lineId !== rest[2]); persist(); return ok(view()); }
    if (method === 'DELETE') { cart.items = []; persist(); return ok(view()); }
    return ok(view());
  }
  if (rest[0] === 'checkout' && method === 'POST') {
    if (!cart.items.length) throw new ApiError(400, 'سبد خرید خالی است');
    const total = cart.items.reduce((a, i) => a + i.price * i.qty, 0);
    // Test-mode gateway: the demo order is marked paid immediately.
    const order = meta({ _id: newId(), orderNumber: `NB-${1000 + db.orders.length + 1}`, status: 'paid', paymentStatus: 'paid', fulfillmentStatus: 'pending', items: cart.items.map((i) => ({ ...i })), total, subtotal: total, currency: 'IRT', customer: body.customer ?? {}, user: who.userId, session: who.sessionId });
    db.orders.unshift(order);
    cart.items = [];
    persist();
    return ok({ orderId: order._id, orderNumber: order.orderNumber, status: order.status, total }, 201);
  }
  if (rest[0] === 'orders') {
    need(staff || claims);
    const rows = staff ? db.orders : db.orders.filter((o) => o.user === who.userId);
    if (rest[1]) { const o = byId(db.orders, rest[1]); if (!o) throw new ApiError(404, 'سفارش پیدا نشد'); return ok(o); }
    return ok(rows);
  }
  return ok({});
}

function bookings(method, rest, { q, body, who, staff, need }) {
  const [a, b, c] = rest;
  if (a === 'availability' || a === 'calendar') {
    const from = q.from ? new Date(q.from).getTime() : Date.now();
    const to = q.to ? new Date(q.to).getTime() : Infinity;
    let slots = db.slots.filter((s) => new Date(s.startsAt).getTime() >= (a === 'calendar' && q.from ? from : from) && new Date(s.startsAt).getTime() <= to);
    if (q.serviceId) slots = slots.filter((s) => s.service === q.serviceId);
    if (q.resourceId) slots = slots.filter((s) => s.resource === q.resourceId);
    slots.sort((x, y) => x.startsAt.localeCompare(y.startsAt));
    if (a === 'availability') return ok({ slots: slots.map((s) => ({ id: s._id, startsAt: s.startsAt, endsAt: s.endsAt, capacity: s.capacityTotal, remaining: s.capacity, available: s.available, service: s.service, resource: s.resource, title: s.title, price: s.price })) });
    need(staff);
    const lo = q.from ? from : Date.now() - 2 * DAY;
    const bookingsIn = db.bookings.filter((x) => new Date(x.startsAt).getTime() >= lo && new Date(x.startsAt).getTime() <= to && (!q.resourceId || x.resource === q.resourceId));
    return ok({ slots, bookings: bookingsIn, total: slots.length });
  }
  if (a === 'slots' && c === 'book' && method === 'POST') {
    const slot = byId(db.slots, b);
    if (!slot) throw new ApiError(404, 'زمان پیدا نشد');
    if (new Date(slot.startsAt).getTime() < Date.now() + settings().leadTimeMinutes * 60_000) throw new ApiError(400, 'این زمان دیگر قابل رزرو نیست');
    if (!body.customerName) throw new ApiError(400, 'نام مشتری الزامی است');
    if (!who.userId && !who.sessionId) throw new ApiError(401, 'برای رزرو وارد شوید یا نشست مهمان بفرستید');
    if (!who.userId && !settings().allowGuestBooking) throw new ApiError(401, 'رزرو مهمان فعال نیست');
    const active = mine(who).filter((x) => ['pending', 'confirmed'].includes(x.status) && new Date(x.startsAt) > new Date()).length;
    if (active >= settings().maxActivePerClient) throw new ApiError(409, `حداکثر ${settings().maxActivePerClient} نوبت فعال می‌توانید داشته باشید`);
    if (body.creditId) consumeCreditRow(body.creditId, who);
    let row;
    try {
      row = createBooking(slot, body, { userId: who.userId, source: 'web' });
    } catch (e) { if (body.creditId) restoreCredit({ creditId: body.creditId }); throw e; }
    if (who.sessionId && !who.userId) row.session = who.sessionId;
    persist();
    return ok(row, 201);
  }
  if (a === 'my') return ok({ items: mine(who).sort((x, y) => y.startsAt.localeCompare(x.startsAt)) });
  if (a === 'credits' && b === 'my') { need(who.userId); return ok({ items: db.credits.filter((x) => x.user === who.userId) }); }
  if (a === 'clients' && c === 'credits') { need(staff); const rows = db.credits.filter((x) => x.client === b); return ok({ items: rows, total: rows.length, limit: 100, skip: 0 }); }
  if (a === 'credits' && !b && method === 'POST') {
    need(staff);
    const client = byId(db.clients, body.clientId);
    if (!client) throw new ApiError(404, 'مشتری پیدا نشد');
    const total = Math.max(1, Number(body.totalSessions || 1));
    const row = meta({ _id: newId(), client: client._id, ...(client.clientUserId ? { user: client.clientUserId } : {}), serviceIds: body.serviceIds ?? [], totalSessions: total, remainingSessions: total, status: 'active', grantReason: body.grantReason, expiresAt: body.expiresAt, sourceType: 'service', unlimited: false });
    db.credits.push(row);
    persist();
    return ok(row, 201);
  }
  if (a === 'credits' && c === 'consume') { need(staff); const cr = byId(db.credits, b); if (!cr || cr.remainingSessions < 1) throw new ApiError(409, 'اعتبار کافی نیست'); cr.remainingSessions -= Number(body.sessions ?? 1); persist(); return ok(cr); }
  if (a === 'bookings' && !b && method === 'POST') {
    need(staff);
    const svc = byId(db.services, body.serviceId);
    const start = Date.now();
    const row = meta({ _id: newId(), type: 'service', source: 'walk_in', mode: 'in_person', slotId: null, status: 'completed', startsAt: new Date(start).toISOString(), endsAt: new Date(start + (body.durationMinutes ?? svc?.durationMinutes ?? 30) * 60_000).toISOString(), service: svc?._id, resource: body.resourceId, customerName: body.customerName, customerPhone: normPhone(body.customerPhone), seats: 1, price: body.price ?? svc?.price ?? 0, totalPrice: body.price ?? svc?.price ?? 0, paymentStatus: 'paid', notes: body.notes });
    if (body.customerPhone) { const c = db.clients.find((x) => x.phoneNumber === row.customerPhone); if (c) { row.client = c._id; c.visitCount += 1; } else { const nc = meta({ _id: newId(), fullName: body.customerName, phoneNumber: row.customerPhone, visitCount: 1, noShowCount: 0 }); db.clients.push(nc); row.client = nc._id; } }
    db.bookings.push(row);
    persist();
    return ok(row, 201);
  }
  if (a === 'bookings' && b) {
    const booking = byId(db.bookings, b);
    if (!booking) throw new ApiError(404, 'رزرو پیدا نشد');
    if (!c && method === 'GET') { assertOwnsOrStaff(booking, { staff, ...who }); return ok(booking); }
    const slot = booking.slotId && byId(db.slots, booking.slotId);
    if (['confirm', 'complete', 'no-show', 'check-in'].includes(c)) {
      need(staff);
      if (c === 'confirm') { booking.status = 'confirmed'; booking.confirmedAt = nowIso(); }
      if (c === 'check-in') booking.checkedInAt = nowIso();
      if (c === 'complete') { booking.status = 'completed'; booking.paymentStatus = 'paid'; const cl = byId(db.clients, booking.client); if (cl) cl.visitCount += 1; }
      if (c === 'no-show') { booking.status = 'no_show'; const cl = byId(db.clients, booking.client); if (cl) { cl.noShowCount += 1; if (cl.noShowCount >= 3) { cl.blockedAt = nowIso(); cl.blockedReason = 'عدم حضور مکرر'; } } }
      booking.updated_at = nowIso();
      persist();
      return ok(booking);
    }
    if (c === 'cancel') {
      assertOwnsOrStaff(booking, { staff, ...who });
      if (['cancelled', 'completed', 'no_show'].includes(booking.status)) throw new ApiError(409, 'این رزرو قابل لغو نیست');
      if (!staff && hoursUntil(booking.startsAt) < settings().cancellationWindowHours) throw new ApiError(409, `لغو فقط تا ${settings().cancellationWindowHours} ساعت قبل از نوبت ممکن است`, 'CANCEL_WINDOW');
      booking.status = 'cancelled'; booking.cancelReason = body.reason; booking.updated_at = nowIso();
      if (slot) releaseSlot(slot, booking.seats);
      if (staff || hoursUntil(booking.startsAt) >= settings().cancellationWindowHours) restoreCredit(booking);
      persist();
      return ok(booking);
    }
    if (c === 'reschedule') {
      assertOwnsOrStaff(booking, { staff, ...who });
      if (!['pending', 'confirmed'].includes(booking.status)) throw new ApiError(409, 'این رزرو قابل جابه‌جایی نیست');
      if (!staff && hoursUntil(booking.startsAt) < settings().rescheduleWindowHours) throw new ApiError(409, `جابه‌جایی فقط تا ${settings().rescheduleWindowHours} ساعت قبل از نوبت ممکن است`, 'RESCHEDULE_WINDOW');
      const target = byId(db.slots, body.newSlotId);
      if (!target) throw new ApiError(404, 'زمان جدید پیدا نشد');
      if (target.service !== booking.service) throw new ApiError(400, 'زمان انتخابی برای همین خدمت نیست');
      claimSlot(target, booking.seats);
      if (slot) releaseSlot(slot, booking.seats);
      booking.status = 'rescheduled';
      const moved = { ...booking, _id: newId(), slotId: target._id, startsAt: target.startsAt, endsAt: target.endsAt, resource: target.resource, status: 'confirmed', rescheduledFromBookingId: booking._id, created_at: nowIso(), updated_at: nowIso() };
      db.bookings.push(moved);
      persist();
      return ok(moved);
    }
  }
  if (a === 'services') {
    need(staff);
    if (method === 'POST' && !b) { const row = meta({ _id: newId(), active: true, kind: 'solo', mode: 'in_person', capacity: 1, ...body }); db.services.push(row); generateSlots(21); persist(); return ok(row, 201); }
    if (method === 'PUT' && b) { const row = byId(db.services, b); if (!row) throw new ApiError(404, 'خدمت پیدا نشد'); Object.assign(row, body, { updated_at: nowIso() }); persist(); return ok(row); }
    if (method === 'GET') return ok(db.services);
  }
  if (a === 'slots' && b === 'generate') { need(staff); const before = db.slots.length; generateSlots(Number(body.daysAhead ?? 21)); persist(); return ok({ generated: db.slots.length - before, created: db.slots.length - before }); }
  if (a === 'events') {
    if (method === 'GET' && !b) return ok({ items: db.events });
    need(staff);
    if (method === 'POST' && !b) { const row = meta({ _id: newId(), status: 'scheduled', registered: 0, ...body }); db.events.push(row); persist(); return ok(row, 201); }
    const ev = byId(db.events, b);
    if (!ev) throw new ApiError(404, 'رویداد پیدا نشد');
    if (c === 'registrations') return ok({ items: db.registrations.filter((r) => r.eventId === ev._id), total: db.registrations.filter((r) => r.eventId === ev._id).length });
    if (c === 'cancel') { ev.status = 'cancelled'; ev.cancelReason = body.reason; db.registrations.filter((r) => r.eventId === ev._id).forEach((r) => { r.status = 'cancelled'; }); persist(); return ok(ev); }
    if (method === 'PUT' || method === 'PATCH') { Object.assign(ev, body, { updated_at: nowIso() }); persist(); return ok(ev); }
    return ok(ev);
  }
  if (a === 'settings') { need(staff); if (method === 'GET') return ok(settings()); Object.assign(settings(), body); persist(); return ok(settings()); }
  if (a === 'locations') return ok({ items: [] });
  throw new ApiError(404, `Route not found: ${method} bookings/${rest.join('/')}`);
}

/* --------------------------------- boot ----------------------------------- */
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { db = JSON.parse(raw); return; }
  } catch { /* fall through to a fresh store */ }
  resetDemo();
}
export function demoSnapshot() {
  if (!db) load();
  return clone(db);
}
export function ensureLoaded() {
  if (!db) load();
}
