import { useMemo, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, UserX } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getCalendar } from '@/api/backoffice/bookings';
import BookingDrawer from '@/components/panel/BookingDrawer';
import PanelShell from '@/components/panel/PanelShell';
import { useLookups, usePanelQuery } from '@/components/panel/data';
import { addDays, dayKey, dayRange, fa, hourLabel, idOf, isLive, jalaliLong, minutesOfDay, timeLabel, todayKey } from '@/components/panel/format';
import { unwrapCalendar } from '@/components/panel/hooks';
import { BLOCK_TONES, btn, card } from '@/components/panel/styles';
import { EmptyState, ErrorState, LoadingState, SelectField, StatusBadge } from '@/components/panel/ui';
import { cn } from '@/lib/utils';

const PX_PER_MIN = 1.5;
const STATUS_ICON = { pending: Clock3, confirmed: null, completed: CheckCircle2, no_show: UserX };

/** Merge a resource's slots into continuous working bands (slots are separated by service buffers). */
function workBands(slots) {
  const spans = slots
    .map((s) => [minutesOfDay(s.startsAt), minutesOfDay(s.endsAt) || 1440])
    .sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const [from, to] of spans) {
    const last = out[out.length - 1];
    if (last && from - last[1] <= 30) last[1] = Math.max(last[1], to);
    else out.push([from, to]);
  }
  return out;
}
const COL_MIN = 150;

function DayGrid({ day, bookings, slots, resources, services, onOpen }) {
  const spans = [...slots, ...bookings].map((row) => [minutesOfDay(row.startsAt), minutesOfDay(row.endsAt) || 24 * 60]);
  const start = Math.floor((spans.length ? Math.min(...spans.map((s) => s[0])) : 10 * 60) / 60) * 60;
  const end = Math.ceil((spans.length ? Math.max(...spans.map((s) => s[1])) : 19 * 60) / 60) * 60;
  const hours = Array.from({ length: Math.max(1, (end - start) / 60) }, (_, i) => start + i * 60);
  const height = (end - start) * PX_PER_MIN;
  const nowMin = day === todayKey() ? minutesOfDay(new Date()) : null;
  const cols = [...resources, ...(bookings.some((b) => !b.resource) ? [{ _id: '__none', name: 'بدون همکار' }] : [])];

  return (
    <div className={cn(card, 'max-h-[calc(100dvh-17rem)] overflow-auto')}>
      <div className="grid min-w-max" style={{ gridTemplateColumns: `3.25rem repeat(${cols.length}, minmax(${COL_MIN}px, 1fr))` }}>
        <div className="sticky start-0 top-0 z-30 border-b border-e border-border bg-surface" />
        {cols.map((r) => (
          <div key={idOf(r)} className="sticky top-0 z-20 flex items-center gap-2 border-b border-e border-border bg-surface px-3 py-2.5 last:border-e-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: r.color || 'var(--muted-foreground)' }} aria-hidden="true">
              {String(r.name || '؟').replace(/^(دکتر|خانم|آقای)\s+/, '').charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{r.name}</span>
              {r.title && <span className="block truncate text-[11px] text-muted-foreground">{r.title}</span>}
            </span>
          </div>
        ))}

        <div className="sticky start-0 z-20 border-e border-border bg-surface" style={{ height }}>
          {hours.map((m) => (
            <div key={m} className="absolute inset-x-0 -translate-y-2 text-center text-[11px] text-muted-foreground" style={{ top: (m - start) * PX_PER_MIN }}>
              {m === start ? '' : hourLabel(m)}
            </div>
          ))}
        </div>
        {cols.map((r) => {
          const id = idOf(r);
          const mine = bookings.filter((b) => (id === '__none' ? !b.resource : String(b.resource) === id));
          const work = slots.filter((s) => String(s.resource) === id);
          return (
            <div key={id} className="relative border-e border-border bg-subtle last:border-e-0" style={{ height }}>
              {workBands(work).map(([from, to]) => (
                <div key={from} className="absolute inset-x-0 bg-background" style={{ top: (from - start) * PX_PER_MIN, height: (to - from) * PX_PER_MIN }} />
              ))}
              {hours.map((m) => (
                <div key={m}>
                  <div className="pointer-events-none absolute inset-x-0 border-t border-border" style={{ top: (m - start) * PX_PER_MIN }} />
                  <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/60" style={{ top: (m + 30 - start) * PX_PER_MIN }} />
                </div>
              ))}
              {mine.map((b) => {
                const top = (minutesOfDay(b.startsAt) - start) * PX_PER_MIN;
                const h = Math.max(30, ((minutesOfDay(b.endsAt) || 1440) - minutesOfDay(b.startsAt)) * PX_PER_MIN - 2);
                const svc = services.get(String(b.service));
                const Icon = STATUS_ICON[b.status];
                return (
                  <button
                    key={idOf(b)}
                    type="button"
                    onClick={() => onOpen(b)}
                    className={cn(
                      'pn-press absolute inset-x-1 overflow-hidden rounded-lg border border-s-4 px-2 py-1 text-start shadow-sm transition hover:z-10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      BLOCK_TONES[b.status] || BLOCK_TONES.confirmed,
                      b.status === 'pending' && 'border-dashed',
                      b.status === 'no_show' && 'opacity-70',
                      b.status === 'completed' && 'opacity-80',
                    )}
                    style={{ top, height: h, borderInlineStartColor: svc?.color || r.color || undefined }}
                    title={`${b.customerName} - ${timeLabel(b.startsAt)} تا ${timeLabel(b.endsAt)}`}
                  >
                    <span className="flex items-center justify-between gap-1">
                      <span className={cn('truncate text-xs font-bold', b.status === 'no_show' && 'line-through')}>{b.customerName}</span>
                      {Icon && <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />}
                    </span>
                    <span className="block truncate text-[11px] opacity-80">
                      {timeLabel(b.startsAt)} تا {timeLabel(b.endsAt)}
                    </span>
                    {h > 58 && <span className="block truncate text-[11px] opacity-80">{svc?.name}</span>}
                  </button>
                );
              })}
              {nowMin !== null && nowMin >= start && nowMin <= end && (
                <div className="pn-now pointer-events-none absolute inset-x-0 z-10 border-t-2 border-rose-500" style={{ top: (nowMin - start) * PX_PER_MIN }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PanelCalendar() {
  const [params] = useSearchParams();
  const [day, setDay] = useState(() => (/^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : todayKey()));
  const [staff, setStaff] = useState('');
  const [selected, setSelected] = useState(null);
  const picker = useRef(null);
  const lookups = useLookups();
  const calendar = usePanelQuery(['calendar', day], async () => unwrapCalendar(await getCalendar({ ...dayRange(day), limit: 1000 })));
  const resources = lookups.resourceList.filter((r) => r.active !== false && (!staff || idOf(r) === staff));
  const data = calendar.data;
  const bookings = useMemo(
    () => (data?.bookings || []).filter((b) => isLive(b) && dayKey(b.startsAt) === day && (!staff || String(b.resource) === staff)),
    [data, day, staff],
  );
  const slots = useMemo(() => (data?.slots || []).filter((s) => dayKey(s.startsAt) === day), [data, day]);
  const counts = bookings.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }), {});
  const loading = calendar.isLoading || lookups.isLoading;

  return (
    <PanelShell title="تقویم روزانه" description="یک ستون برای هر همکار؛ روی نوبت کلیک کنید">
      <div className={cn(card, 'flex flex-wrap items-end gap-3 p-3')}>
        <div className="w-full min-w-0 sm:w-auto sm:flex-1">
          <p className="text-base font-bold">{jalaliLong(day)}</p>
          <p className="text-xs text-muted-foreground">
            {fa(bookings.length)} نوبت
            {counts.pending ? ` · ${fa(counts.pending)} منتظر تأیید` : ''}
            {counts.completed ? ` · ${fa(counts.completed)} انجام‌شده` : ''}
            {counts.no_show ? ` · ${fa(counts.no_show)} عدم حضور` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className={cn(btn.outline, 'w-10 px-0')} aria-label="روز قبل" onClick={() => setDay(addDays(day, -1))}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
          <button type="button" className={btn.outline} onClick={() => setDay(todayKey())} disabled={day === todayKey()}>
            امروز
          </button>
          <button type="button" className={cn(btn.outline, 'w-10 px-0')} aria-label="روز بعد" onClick={() => setDay(addDays(day, 1))}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="relative">
          <button type="button" className={btn.outline} onClick={() => picker.current?.showPicker?.()}>
            <CalendarDays className="size-4" aria-hidden="true" />
            انتخاب تاریخ
          </button>
          <input ref={picker} type="date" aria-label="انتخاب تاریخ" tabIndex={-1} className="pointer-events-none absolute inset-0 opacity-0" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} />
        </div>
        <SelectField
          label="همکار"
          className="w-full sm:w-44"
          value={staff}
          onChange={setStaff}
          placeholder="همه همکاران"
          options={lookups.resourceList.filter((r) => r.active !== false).map((r) => ({ value: idOf(r), label: r.name }))}
        />
      </div>

      <div className="hidden flex-wrap items-center gap-2 text-xs text-muted-foreground sm:flex">
        <StatusBadge status="pending" />
        <StatusBadge status="confirmed" />
        <StatusBadge status="completed" />
        <StatusBadge status="no_show" />
        <span className="ms-2 inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-border bg-background" /> ساعت کاری
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-subtle" /> خارج از ساعت کاری
        </span>
      </div>

      {loading ? (
        <LoadingState rows={6} />
      ) : calendar.isError ? (
        <ErrorState error={calendar.error} onRetry={() => void calendar.refetch()} />
      ) : !resources.length ? (
        <EmptyState title="همکاری تعریف نشده است" hint="از بخش «خدمات و برنامه کاری» همکار اضافه کنید." />
      ) : (
        <>
          {!slots.length && !bookings.length && (
            <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">برای این روز ساعت کاری یا نوبتی ثبت نشده است (تعطیلی یا خارج از برنامه هفتگی).</p>
          )}
          <DayGrid day={day} bookings={bookings} slots={slots} resources={resources} services={lookups.services} onOpen={setSelected} />
        </>
      )}
      {selected && <BookingDrawer booking={selected} lookups={lookups} onClose={() => setSelected(null)} />}
    </PanelShell>
  );
}
