/** Helpers for working with bookings-plugin `slot` rows. */

export function slotId(slot) {
  return slot?._id ?? slot?.id ?? null;
}

/** Local date key (YYYY-MM-DD) for grouping slots by day. */
export function slotDateKey(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatSlotDate(iso, locale = 'fa-IR', options) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(
    locale,
    options ?? { weekday: 'short', day: 'numeric', month: 'long' },
  );
}

export function formatSlotTime(iso, locale = 'fa-IR') {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/** "HH:mm – HH:mm" range for a slot row. */
export function formatSlotRange(slot, locale = 'fa-IR') {
  if (!slot) return '';
  return `${formatSlotTime(slot.startsAt, locale)} – ${formatSlotTime(slot.endsAt, locale)}`;
}
