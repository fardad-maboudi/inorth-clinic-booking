/**
 * Slot picker — matches the bookings plugin contract.
 *
 * Availability is `slot` ROWS from `listSlots` (`@/api/plugins/bookings`), not
 * an invented "HH:mm" grid: each slot has `startsAt`, `endsAt`, `capacity?`,
 * `available`. Dates are derived from the slots themselves; picking a date
 * filters the list, picking a time selects the whole slot object.
 *
 * Props:
 *   slots        — slot rows ({ _id | id, startsAt, endsAt, available, capacity? })
 *   selectedSlot — currently selected slot object (or null)
 *   onSelect     — (slot) => void
 *   loading      — show spinner while slots load
 */
import { Clock, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { slotId, slotDateKey, formatSlotDate, formatSlotRange } from './slot-utils';

export function SlotPicker({
  slots = [],
  selectedSlot = null,
  onSelect,
  loading = false,
  locale = 'fa-IR',
  title = 'انتخاب زمان',
  subtitle = 'یکی از زمان‌های آزاد را انتخاب کنید',
  datesTitle = 'تاریخ',
  timesTitle = 'ساعات آزاد',
  emptyLabel = 'فعلاً زمان آزادی ثبت نشده است',
  pickDateFirst = 'ابتدا یک تاریخ انتخاب کنید',
}) {
  // Group slots by local day, sorted chronologically.
  const days = useMemo(() => {
    const byDay = new Map();
    for (const slot of slots) {
      const key = slotDateKey(slot.startsAt);
      if (!key) continue;
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(slot);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, daySlots]) => ({
        key,
        label: formatSlotDate(daySlots[0].startsAt, locale),
        slots: daySlots.sort((a, b) =>
          String(a.startsAt).localeCompare(String(b.startsAt)),
        ),
      }));
  }, [slots, locale]);

  const [pickedDay, setPickedDay] = useState(null);
  const activeDayKey =
    pickedDay ?? (selectedSlot ? slotDateKey(selectedSlot.startsAt) : days[0]?.key);
  const activeDay = days.find((d) => d.key === activeDayKey) ?? null;

  return (
    <div data-testid="slot-picker">
      <h2 className="font-heading mb-2 text-2xl font-light text-ink">
        {title}
      </h2>
      <p className="mb-8 text-muted">{subtitle}</p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : days.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">{emptyLabel}</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-surface border border-border bg-card p-surface">
            <label className="mb-3 block text-sm font-medium text-ink">
              {datesTitle}
            </label>
            <div className="grid max-h-[400px] gap-2 overflow-y-auto pe-1">
              {days.map((day) => {
                const isActive = day.key === activeDayKey;
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setPickedDay(day.key)}
                    className={
                      'rounded-control px-4 py-3 text-start text-sm transition-all duration-200 ' +
                      (isActive
                        ? 'bg-brand-500 text-on-brand-500'
                        : 'cursor-pointer bg-subtle text-ink hover:bg-brand-100/40')
                    }
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-surface border border-border bg-card p-surface">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-500" />
              <h3 className="font-medium text-ink">
                {timesTitle}
              </h3>
            </div>

            {!activeDay ? (
              <p className="py-8 text-center text-sm text-muted">
                {pickDateFirst}
              </p>
            ) : (
              <div className="grid max-h-[400px] grid-cols-2 gap-2 overflow-y-auto pe-1">
                {activeDay.slots.map((slot) => {
                  const id = slotId(slot);
                  const available = slot.available !== false;
                  const isSelected = slotId(selectedSlot) === id;
                  return (
                    <button
                      key={id ?? slot.startsAt}
                      type="button"
                      disabled={!available}
                      onClick={() => available && onSelect?.(slot)}
                      className={
                        'rounded-control px-3 py-2 text-sm transition-all duration-200 ' +
                        (isSelected
                          ? 'bg-brand-500 text-on-brand-500'
                          : available
                            ? 'cursor-pointer bg-subtle text-ink hover:bg-brand-100/40'
                            : 'cursor-not-allowed bg-subtle text-muted line-through')
                      }
                    >
                      {formatSlotRange(slot, locale)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SlotPicker;
