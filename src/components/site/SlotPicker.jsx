import { useMemo, useRef, useState } from 'react';
import { listSlots } from '@/api/plugins/bookings';
import { StateBox } from './ui';
import { dayKey, errText, fmtDayNum, fmtFullDate, fmtMonthYear, fmtTime, fmtWeekday, idOf, nf } from './format';
import { useAsync } from './hooks';

/**
 * Jalali day strip + time grid. `resourceId` = a staff id or 'any'.
 * With 'any' the first free slot per start time is used; `onChange` receives
 * the chosen slot row so the caller knows which staff member it belongs to.
 * `excludeSlotId` hides the slot being rescheduled.
 */
export default function SlotPicker({ serviceId, resourceId = 'any', value, onChange, excludeSlotId }) {
  const query = useAsync(
    () => listSlots({ serviceId, resourceId: resourceId === 'any' ? undefined : resourceId }),
    [serviceId, resourceId],
  );
  const [picked, setDay] = useState(null);
  const strip = useRef(null);

  const { days, byDay } = useMemo(() => {
    const rows = (Array.isArray(query.data) ? query.data : [])
      .filter((s) => s.available !== false && idOf(s) !== excludeSlotId)
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    const map = new Map();
    for (const s of rows) {
      const k = dayKey(s.startsAt);
      const list = map.get(k) ?? [];
      if (!list.some((x) => x.startsAt === s.startsAt)) list.push(s);
      map.set(k, list);
    }
    return { days: [...map.keys()], byDay: map };
  }, [query.data, excludeSlotId]);

  const chosenDay = value ? dayKey(value.startsAt) : null;
  const day = picked && byDay.has(picked) ? picked : chosenDay && byDay.has(chosenDay) ? chosenDay : days[0];

  if (query.loading) {
    return (
      <div className="cl-slotpicker cl-slot-skel" aria-busy="true" role="status" aria-label="در حال دریافت زمان‌های خالی">
        <div className="cl-skel" style={{ height: 88 }} />
        <div className="cl-skel" style={{ height: 150 }} />
      </div>
    );
  }
  if (query.error) return <StateBox kind="error" title="زمان‌های خالی دریافت نشد" text={errText(query.error)} onRetry={query.reload} />;
  if (!days.length) {
    return <StateBox kind="empty" title="فعلاً زمان خالی وجود ندارد" text="برای این انتخاب نوبتی در سه هفتهٔ آینده باقی نمانده است. متخصص دیگری را امتحان کنید." />;
  }

  const slots = byDay.get(day) ?? [];
  const scroll = (dir) => strip.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  const first = byDay.get(day)?.[0]?.startsAt;

  return (
    <div className="cl-slotpicker">
      <div className="cl-slot-head">
        <h3 id="slot-month">{first ? fmtMonthYear(first) : ''}</h3>
        <div className="cl-slot-nav">
          <button type="button" className="cl-iconbtn" onClick={() => scroll(1)} aria-label="روزهای قبل">
            <span aria-hidden="true">›</span>
          </button>
          <button type="button" className="cl-iconbtn" onClick={() => scroll(-1)} aria-label="روزهای بعد">
            <span aria-hidden="true">‹</span>
          </button>
        </div>
      </div>
      <div className="cl-days" ref={strip} role="listbox" aria-labelledby="slot-month" aria-label="انتخاب روز">
        {days.map((k) => {
          const iso = byDay.get(k)[0].startsAt;
          const on = k === day;
          return (
            <button
              key={k}
              type="button"
              role="option"
              aria-selected={on}
              className={`cl-day${on ? ' on' : ''}`}
              onClick={() => setDay(k)}
              aria-label={`${fmtFullDate(iso)}، ${nf(byDay.get(k).length)} زمان خالی`}
            >
              <span className="cl-day-w">{fmtWeekday(iso)}</span>
              <span className="cl-day-n">{fmtDayNum(iso)}</span>
              <span className="cl-day-c">{nf(byDay.get(k).length)} نوبت</span>
            </button>
          );
        })}
      </div>
      <p className="cl-slot-date" aria-live="polite">{first ? fmtFullDate(first) : ''}</p>
      <div className="cl-times" role="listbox" aria-label="انتخاب ساعت">
        {slots.map((s) => {
          const on = value && idOf(value) === idOf(s);
          return (
            <button
              key={idOf(s)}
              type="button"
              role="option"
              aria-selected={!!on}
              className={`cl-time${on ? ' on' : ''}`}
              onClick={() => onChange?.(s)}
            >
              {fmtTime(s.startsAt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
