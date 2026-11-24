import { useEffect, useMemo, useRef, useState } from "react";
import { dayKey, digits, faDay, faMonth, faMonthYear, faTime, relativeDay, tehranHour } from "./format";

/** Group slots by Tehran calendar day, sorted. */
function groupByDay(slots) {
  const map = new Map();
  for (const slot of [...slots].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))) {
    const key = dayKey(slot.startsAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(slot);
  }
  return [...map.entries()].map(([key, items]) => ({ key, items }));
}

const PARTS = [
  ["صبح", (hour) => hour < 12],
  ["بعدازظهر", (hour) => hour >= 12],
];

/**
 * Jalali day strip + time chips grouped by part of day. `value` is the
 * selected slot id; `onChange` receives the slot row. Slots come from the
 * server already bookable.
 */
export default function SlotPicker({ slots, value, onChange }) {
  const days = useMemo(() => groupByDay(slots), [slots]);
  const selectedDay = days.find((day) => day.items.some((slot) => slot.id === value))?.key;
  const [pickedDay, setPickedDay] = useState(null);
  const activeKey = pickedDay ?? selectedDay ?? days[0]?.key;
  const active = days.find((day) => day.key === activeKey);
  const first = active?.items[0]?.startsAt;
  const strip = useRef(null);

  // Keep the chosen day visible when the strip is wider than the screen.
  useEffect(() => {
    strip.current?.querySelector("[aria-selected=true]")?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [activeKey]);

  return (
    <div>
      <p className="mb-2.5 px-1 text-sm font-bold text-muted-foreground">{first ? faMonthYear(first) : ""}</p>
      <div ref={strip} role="tablist" aria-label="روز" className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1">
        {days.map((day, index) => {
          const on = day.key === activeKey;
          const iso = day.items[0].startsAt;
          return (
            <button
              key={day.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setPickedDay(day.key)}
              style={{ "--i": Math.min(index, 6) }}
              className={`ma-rise ma-press flex min-h-[80px] w-[66px] shrink-0 snap-start flex-col items-center justify-center rounded-surface px-1 text-center ring-1 ${
                on ? "bg-primary text-primary-foreground shadow-[0_10px_20px_-10px_color-mix(in_srgb,var(--primary)_80%,transparent)] ring-primary" : "bg-card ring-foreground/10"
              }`}
            >
              <span className={`text-xs leading-5 ${on ? "opacity-85" : "text-muted-foreground"}`}>{relativeDay(iso)}</span>
              <span className="text-[22px] font-extrabold leading-7">{faDay(iso)}</span>
              <span className={`text-xs leading-5 ${on ? "opacity-85" : "text-muted-foreground"}`}>{faMonth(iso)}</span>
            </button>
          );
        })}
      </div>

      {active ? (
        <div key={active.key} className="mt-6">
          <p className="mb-3 px-1 text-sm text-muted-foreground">
            {digits.format(active.items.length)} نوبت آزاد برای {relativeDay(first)}
          </p>
          {PARTS.map(([label, test]) => {
            const items = active.items.filter((slot) => test(tehranHour(slot.startsAt)));
            if (!items.length) return null;
            return (
              <div key={label} className="mb-5">
                <h3 className="mb-2 px-1 text-[13px] font-bold">{label}</h3>
                <div role="listbox" aria-label={label} className="grid grid-cols-3 gap-2.5">
                  {items.map((slot, index) => {
                    const on = slot.id === value;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        role="option"
                        aria-selected={on}
                        onClick={() => onChange(slot)}
                        style={{ "--i": index }}
                        className={`ma-fade ma-press h-12 rounded-control text-base font-bold ring-1 ${
                          on ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-foreground/10 active:bg-foreground/[.05]"
                        }`}
                      >
                        {faTime(slot.startsAt)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
