import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { generateSlots } from '@/api/backoffice/bookings';
import { rec, usePanelMutation } from './data';
import { WEEKDAY_LABELS, WEEK_ORDER, idOf } from './format';
import { btn, inputCls } from './styles';
import { Spinner } from './ui';
import { cn } from '@/lib/utils';

const toDraft = (schedules) => {
  const draft = Object.fromEntries(WEEK_ORDER.map((d) => [d, []]));
  for (const s of schedules) {
    if (s.active === false || !draft[s.weekday]) continue;
    draft[s.weekday].push({ id: idOf(s), startTime: s.startTime, endTime: s.endTime });
  }
  for (const d of WEEK_ORDER) draft[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
  return draft;
};
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Weekly hours of one staff member. Saving diffs against the stored rows, then regenerates open slots. */
export default function HoursEditor({ resource, schedules, horizonDays = 21, interval = 30 }) {
  const rid = idOf(resource);
  const [draft, setDraft] = useState(() => toDraft(schedules));
  const original = schedules.filter((s) => s.active !== false);
  const invalid = Object.values(draft).flat().some((r) => !TIME.test(r.startTime) || !TIME.test(r.endTime) || r.startTime >= r.endTime);
  const edit = (day, index, patch) => setDraft((d) => ({ ...d, [day]: d[day].map((r, i) => (i === index ? { ...r, ...patch } : r)) }));

  const save = usePanelMutation(
    async () => {
      const store = rec('booking_schedule');
      const keep = new Set(Object.values(draft).flat().map((r) => r.id).filter(Boolean));
      for (const old of original) if (!keep.has(idOf(old))) await store.remove(idOf(old));
      for (const day of WEEK_ORDER) {
        for (const row of draft[day]) {
          if (row.id) {
            const old = original.find((o) => idOf(o) === row.id);
            if (old.startTime !== row.startTime || old.endTime !== row.endTime) await store.update(row.id, { startTime: row.startTime, endTime: row.endTime });
          } else {
            await store.create({ resource: rid, weekday: day, startTime: row.startTime, endTime: row.endTime, slotIntervalMinutes: interval, active: true });
          }
        }
      }
      try {
        await generateSlots({ resourceId: rid, daysAhead: horizonDays });
      } catch {
        // Hours are saved; slot generation is retried by the server's own schedule.
      }
    },
    { success: 'ساعت کاری ذخیره و زمان‌های آزاد به‌روز شد' },
  );

  return (
    <div className="space-y-2">
      {WEEK_ORDER.map((day) => (
        <div key={day} className="flex flex-wrap items-start gap-3 rounded-lg border border-border p-3">
          <p className={cn('w-20 shrink-0 pt-2 text-sm font-medium', !draft[day].length && 'text-muted-foreground')}>{WEEKDAY_LABELS[day]}</p>
          <div className="min-w-0 flex-1 space-y-2">
            {draft[day].length === 0 && <p className="pt-2 text-xs text-muted-foreground">تعطیل</p>}
            {draft[day].map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input dir="ltr" aria-label={`شروع ${WEEKDAY_LABELS[day]}`} className={cn(inputCls, 'w-24 text-center')} value={row.startTime} placeholder="10:00" onChange={(e) => edit(day, i, { startTime: e.target.value })} />
                <span className="text-xs text-muted-foreground">تا</span>
                <input dir="ltr" aria-label={`پایان ${WEEKDAY_LABELS[day]}`} className={cn(inputCls, 'w-24 text-center')} value={row.endTime} placeholder="18:00" onChange={(e) => edit(day, i, { endTime: e.target.value })} />
                <button type="button" className="grid size-9 place-items-center rounded-lg text-destructive hover:bg-destructive/10" aria-label="حذف بازه" onClick={() => setDraft((d) => ({ ...d, [day]: d[day].filter((_, j) => j !== i) }))}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className={cn(btn.ghost, btn.sm)} onClick={() => setDraft((d) => ({ ...d, [day]: [...d[day], { startTime: '10:00', endTime: '18:00' }] }))}>
            <Plus className="size-3.5" aria-hidden="true" />
            بازه
          </button>
        </div>
      ))}
      {invalid && <p className="text-xs text-destructive">ساعت‌ها باید به شکل ۱۰:۰۰ (اعداد انگلیسی) و شروع قبل از پایان باشد.</p>}
      <button type="button" className={btn.primary} disabled={invalid || save.isPending} onClick={() => save.mutate()}>
        {save.isPending && <Spinner />}
        ذخیره ساعت کاری
      </button>
    </div>
  );
}
