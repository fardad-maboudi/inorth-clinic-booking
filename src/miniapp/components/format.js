/** Jalali / Tehran-time formatting and booking-rule helpers for the Mini App. */
export const TZ = "Asia/Tehran";

const jalali = (options) => new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: TZ, ...options });
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("fa-IR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const fmtWeekday = jalali({ weekday: "long" });
const fmtDay = jalali({ day: "numeric" });
const fmtMonth = jalali({ month: "long" });
const fmtLong = jalali({ weekday: "long", day: "numeric", month: "long" });

export const digits = new Intl.NumberFormat("fa-IR");

/** `YYYY-MM-DD` of the instant in Tehran, used to group slots by calendar day. */
export const dayKey = (iso) => dayKeyFmt.format(new Date(iso));
export const faTime = (iso) => timeFmt.format(new Date(iso));
export const faWeekday = (iso) => fmtWeekday.format(new Date(iso));
export const faDay = (iso) => fmtDay.format(new Date(iso));
export const faMonth = (iso) => fmtMonth.format(new Date(iso));
export const faDateLong = (iso) => fmtLong.format(new Date(iso));
export const faDateTime = (iso) => `${faDateLong(iso)}، ساعت ${faTime(iso)}`;

/** «امروز» / «فردا» for the nearest two days, otherwise the weekday name. */
export function relativeDay(iso) {
  const key = dayKey(iso);
  const now = Date.now();
  if (key === dayKey(now)) return "امروز";
  if (key === dayKey(now + 86_400_000)) return "فردا";
  return faWeekday(iso);
}

export const STATUS_LABEL = {
  pending: "در انتظار تأیید",
  confirmed: "تأیید شده",
  cancelled: "لغو شده",
  completed: "انجام شد",
  no_show: "عدم حضور",
  rescheduled: "جابه‌جا شد",
};

export const ACTIVE_STATUSES = new Set(["pending", "confirmed"]);

/**
 * Mirrors the server's cancellation/reschedule rule (booking-rules.service):
 * allowed while at least `hours` remain, with the same 60-second grace.
 * UI hint only; the server re-checks every change.
 */
export function withinWindow(startsAt, hours, now = Date.now()) {
  return new Date(startsAt).getTime() - now >= Number(hours ?? 24) * 3_600_000 - 60_000;
}

/** "۲۴ ساعت" or "۲ ساعت" from a negative-minutes reminder offset. */
export function offsetLabel(minutes) {
  const abs = Math.abs(Number(minutes));
  if (abs >= 2880 && abs % 1440 === 0) return `${digits.format(abs / 1440)} روز`;
  if (abs % 60 === 0) return `${digits.format(abs / 60)} ساعت`;
  return `${digits.format(abs)} دقیقه`;
}

export function errorText(error, fallback = "خطایی رخ داد. دوباره تلاش کنید.") {
  const text = error?.message;
  return typeof text === "string" && text.trim() ? text : fallback;
}

const fmtMonthYear = jalali({ month: "long", year: "numeric" });
const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false });
export const faMonthYear = (iso) => fmtMonthYear.format(new Date(iso));
/** Hour of day (0-23) in Tehran. */
export const tehranHour = (iso) => Number(hourFmt.format(new Date(iso))) % 24;

/** «۱۹ ساعت دیگر» / «۳ روز دیگر» from a fixed `now` (kept out of render for purity). */
export function untilLabel(iso, now) {
  const minutes = Math.round((new Date(iso).getTime() - now) / 60_000);
  if (minutes <= 0) return "اکنون";
  if (minutes < 60) return `${digits.format(minutes)} دقیقه دیگر`;
  if (minutes < 2880) return `${digits.format(Math.round(minutes / 60))} ساعت دیگر`;
  return `${digits.format(Math.round(minutes / 1440))} روز دیگر`;
}

/** «امروز، یکشنبه ۳ آبان» / «فردا، …»; later days are just the long date (it already names the weekday). */
export function faDateRelative(iso) {
  const key = dayKey(iso);
  const now = Date.now();
  if (key === dayKey(now)) return `امروز، ${faDateLong(iso)}`;
  if (key === dayKey(now + 86_400_000)) return `فردا، ${faDateLong(iso)}`;
  return faDateLong(iso);
}
