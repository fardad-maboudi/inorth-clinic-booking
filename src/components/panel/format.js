/**
 * Formatting helpers for the staff panel: Persian digits, Jalali dates,
 * Asia/Tehran civil days, toman prices and booking-status vocabulary.
 * Iran has had no DST since 2022, so a Tehran day is a fixed +03:30 window.
 */
export const TZ = 'Asia/Tehran';
const OFFSET = '+03:30';

export const idOf = (row) => String(row?._id || row?.id || '');

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
export const toFaDigits = (value) => String(value ?? '').replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
/** Persian/Arabic-Indic digits to ASCII, for parsing what staff type. */
export const toEnDigits = (value) =>
  String(value ?? '')
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
export const fa = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString('fa-IR') : '—');
export const num = (value) => {
  const n = Number(toEnDigits(value).replace(/[,٬\s]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

const keyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const hmFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Tehran civil date of an instant as `YYYY-MM-DD`. */
export const dayKey = (value) => keyFormat.format(new Date(value));
export const todayKey = () => dayKey(new Date());
const atNoon = (key) => new Date(`${key}T12:00:00${OFFSET}`);
export const addDays = (key, n) => dayKey(new Date(atNoon(key).getTime() + n * 86400000));
export const dayRange = (key) => ({ from: `${key}T00:00:00${OFFSET}`, to: `${key}T23:59:59.999${OFFSET}` });
export const rangeOf = (fromKey, toKey) => ({
  from: `${fromKey}T00:00:00${OFFSET}`,
  to: `${toKey}T23:59:59.999${OFFSET}`,
});
export const isoAt = (key, hhmm) => `${key}T${hhmm}:00${OFFSET}`;

/** Minutes since Tehran midnight for an instant. */
export const minutesOfDay = (value) => {
  const [h, m] = hmFormat.format(new Date(value)).split(':').map(Number);
  return h * 60 + m;
};

const jalali = (options) => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: TZ, ...options });
const longFmt = jalali({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const midFmt = jalali({ weekday: 'short', day: 'numeric', month: 'long' });
const shortFmt = jalali({ year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('fa-IR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export const jalaliLong = (value) => (value ? longFmt.format(typeof value === 'string' && value.length === 10 ? atNoon(value) : new Date(value)) : '—');
export const jalaliMid = (value) => (value ? midFmt.format(typeof value === 'string' && value.length === 10 ? atNoon(value) : new Date(value)) : '—');
export const jalaliShort = (value) => (value ? shortFmt.format(typeof value === 'string' && value.length === 10 ? atNoon(value) : new Date(value)) : '—');
export const timeLabel = (value) => (value ? timeFmt.format(new Date(value)) : '—');
export const dateTimeLabel = (value) => (value ? `${jalaliMid(value)}، ${timeLabel(value)}` : '—');
export const hourLabel = (minutes) => timeFmt.format(new Date(atNoon('2026-01-01').getTime() + (minutes - 12 * 60) * 60000));

/** Prices are stored in rials (`currency: 'IRR'`) and shown in toman. */
export const toToman = (value, currency = 'IRR') => Math.round(Number(value || 0) / (currency === 'IRT' ? 1 : 10));
export const fromToman = (toman, currency = 'IRR') => Math.round(Number(toman || 0) * (currency === 'IRT' ? 1 : 10));
export const tomanLabel = (value, currency = 'IRR') =>
  Number(value) > 0 ? `${fa(toToman(value, currency))} تومان` : 'رایگان';

/** Show an Iranian mobile the way a receptionist dials it: 0912…, always LTR. */
export const phoneLabel = (phone) => {
  const digits = toEnDigits(phone || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('98') && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
};

export const STATUS_LABELS = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأییدشده',
  cancelled: 'لغوشده',
  completed: 'انجام‌شده',
  no_show: 'عدم حضور',
  rescheduled: 'جابه‌جاشده',
};
export const SOURCE_LABELS = {
  web: 'سایت',
  telegram: 'تلگرام',
  miniapp: 'مینی‌اپ',
  phone: 'تلفنی',
  walk_in: 'حضوری',
  staff: 'ثبت همکار',
};
export const PAYMENT_LABELS = {
  unpaid: 'پرداخت‌نشده',
  deposit_paid: 'بیعانه',
  paid: 'پرداخت‌شده',
  refunded: 'بازپرداخت',
  credit: 'از بسته',
};
export const TIMEOFF_KINDS = {
  holiday: 'تعطیل رسمی',
  vacation: 'مرخصی',
  sick: 'بیماری',
  break: 'استراحت',
  closed: 'تعطیلی کسب‌وکار',
  other: 'سایر',
};
/** Calendar weekday (Date.getDay) labels in the Iranian week order, Saturday first. */
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];
export const WEEKDAY_LABELS = {
  6: 'شنبه',
  0: 'یکشنبه',
  1: 'دوشنبه',
  2: 'سه‌شنبه',
  3: 'چهارشنبه',
  4: 'پنج‌شنبه',
  5: 'جمعه',
};

export const errMsg = (error) => {
  const text = error?.message;
  return typeof text === 'string' && text ? text : 'عملیات انجام نشد. دوباره تلاش کنید.';
};

/** Rows the staff can still act on. */
export const isOpenStatus = (status) => status === 'pending' || status === 'confirmed';
/** A booking row that occupies the calendar (history rows excluded). */
export const isLive = (booking) => booking && booking.status !== 'cancelled' && booking.status !== 'rescheduled';
