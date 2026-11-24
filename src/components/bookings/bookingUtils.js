export const idOf = (row) => String(row?._id || row?.id || '');

export const dateKey = (iso) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('fa-IR', {
        timeZone: 'Asia/Tehran',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

export const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString('fa-IR', {
        timeZone: 'Asia/Tehran',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export const priceLabel = (value) =>
  Number(value) > 0 ? Number(value).toLocaleString('fa-IR') + ' تومان' : 'رایگان';

export const STATUS = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأییدشده',
  cancelled: 'لغوشده',
  completed: 'انجام‌شده',
  no_show: 'عدم حضور',
  rescheduled: 'جابه‌جاشده',
};

export const buttonClass =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40';
export const primaryClass = buttonClass + ' bg-primary text-on-primary';
export const inputClass =
  'min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';
export const panelClass = 'min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-6';

const DAY = 86400000;
export const civilDate = (key) => new Date(key + 'T12:00:00Z');
const civilKey = (date) => date.toISOString().slice(0, 10);
function persianParts(date) {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-US-u-ca-persian', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
      .formatToParts(date)
      .map((part) => [part.type, Number(part.value)]),
  );
}

export function monthGrid(key) {
  const date = civilDate(key);
  const parts = persianParts(date);
  const first = new Date(date.getTime() - (parts.day - 1) * DAY);
  const offset = (first.getUTCDay() + 1) % 7;
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(first.getTime() + (index - offset) * DAY);
    return {
      key: civilKey(day),
      day: persianParts(day).day,
      inMonth: persianParts(day).month === parts.month,
    };
  });
  return {
    first: civilKey(first),
    previous: civilKey(new Date(first.getTime() - DAY)),
    next:
      cells.find((cell) => cell.key > key && !cell.inMonth)?.key ||
      civilKey(new Date(first.getTime() + 32 * DAY)),
    cells,
  };
}
