/** Persian/Jalali/Tehran formatting helpers for the clinic visitor site. */
const TZ = 'Asia/Tehran';
const CAL = 'fa-IR-u-ca-persian';

export const nf = (n) => Number(n || 0).toLocaleString('fa-IR');

export const toPersianDigits = (str) => {
  if (str === null || str === undefined || str === '') return '';
  const p = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (d) => p[+d]);
};

/** Rows from any list-ish SDK answer. */
export const rowsOf = (r) => (Array.isArray(r) ? r : (r?.items ?? r?.data ?? r?.rows ?? []));
export const idOf = (row) => String(row?._id ?? row?.id ?? '');

/** Stored price -> toman. IRR is divided by ten; IRT/TOMAN is shown as is. */
export function toToman(amount, currency = 'IRR') {
  const v = Number(amount) || 0;
  return String(currency).toUpperCase() === 'IRR' ? Math.round(v / 10) : v;
}
export function money(amount, currency = 'IRR') {
  const v = toToman(amount, currency);
  return v > 0 ? `${nf(v)} تومان` : 'رایگان';
}

/** Gregorian YYYY-MM-DD of the Tehran calendar day (stable grouping key). */
export const dayKey = (iso) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(iso),
  );

const fmt = (iso, opts) => (iso ? new Intl.DateTimeFormat(CAL, { timeZone: TZ, ...opts }).format(new Date(iso)).replace(/,/g, '،') : '—');
export const fmtFullDate = (iso) => fmt(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const fmtShortDate = (iso) => fmt(iso, { day: 'numeric', month: 'long' });
export const fmtWeekday = (iso) => fmt(iso, { weekday: 'short' });
export const fmtDayNum = (iso) => fmt(iso, { day: 'numeric' });
export const fmtMonth = (iso) => fmt(iso, { month: 'long' });
export const fmtMonthYear = (iso) => fmt(iso, { month: 'long', year: 'numeric' });
export const fmtTime = (iso) =>
  iso ? new Intl.DateTimeFormat('fa-IR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso)) : '—';

export const durationLabel = (min) => {
  const m = Number(min) || 0;
  if (m >= 60 && m % 60 === 0) return `${nf(m / 60)} ساعت`;
  if (m > 60) return `${nf(Math.floor(m / 60))} ساعت و ${nf(m % 60)} دقیقه`;
  return `${nf(m)} دقیقه`;
};

export const STATUS_FA = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأییدشده',
  cancelled: 'لغوشده',
  completed: 'انجام‌شده',
  no_show: 'عدم حضور',
  rescheduled: 'جابه‌جاشده',
};

/** Persian/Arabic digits -> ASCII. */
export const latinDigits = (v) =>
  String(v ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

/** Iranian mobile -> 09XXXXXXXXX or '' when invalid. */
export function normalizePhone(raw) {
  let d = latinDigits(raw).replace(/[^\d+]/g, '');
  if (d.startsWith('+98')) d = '0' + d.slice(3);
  else if (d.startsWith('0098')) d = '0' + d.slice(4);
  else if (d.startsWith('98') && d.length === 12) d = '0' + d.slice(2);
  else if (d.startsWith('9') && d.length === 10) d = '0' + d;
  return /^09\d{9}$/.test(d) ? d : '';
}

export const initials = (name = '') => {
  const parts = String(name).replace(/^(دکتر|دکترا)\s+/, '').trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
};

/** Friendly message from an SDK error (server messages are already Persian). */
export const errText = (e, fallback = 'خطایی رخ داد. دوباره تلاش کنید.') =>
  (e && typeof e.message === 'string' && /[؀-ۿ]/.test(e.message) ? e.message : fallback);
