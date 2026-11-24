import { useMemo, useState } from 'react';
import { completeBooking, confirmBooking, noShowBooking } from '@/api/backoffice/bookings';
import BookingDrawer from '@/components/panel/BookingDrawer';
import PanelShell from '@/components/panel/PanelShell';
import { useBookings, useLookups, usePanelMutation } from '@/components/panel/data';
import { addDays, dayKey, fa, idOf, jalaliMid, phoneLabel, timeLabel, todayKey, STATUS_LABELS, SOURCE_LABELS } from '@/components/panel/format';
import { btn, card, inputCls } from '@/components/panel/styles';
import { ConfirmDialog, DataTable, DatePick, EmptyState, Field, QueryBoundary, SelectField, StatusBadge } from '@/components/panel/ui';
import { cn } from '@/lib/utils';

const TABS = [
  ['open', 'فعال'],
  ['pending', 'در انتظار'],
  ['confirmed', 'تأییدشده'],
  ['completed', 'انجام‌شده'],
  ['no_show', 'عدم حضور'],
  ['cancelled', 'لغوشده'],
  ['all', 'همه'],
];
const PAGE = 25;

export default function PanelAppointments() {
  const bookings = useBookings(500);
  const lookups = useLookups();
  const [tab, setTab] = useState('open');
  const [staff, setStaff] = useState('');
  const [day, setDay] = useState('');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState(null);
  const [noShowTarget, setNoShowTarget] = useState(null);
  const confirm = usePanelMutation((id) => confirmBooking(id), { success: 'نوبت تأیید شد' });
  const complete = usePanelMutation((id) => completeBooking(id), { success: 'نوبت انجام‌شده ثبت شد' });
  const noShow = usePanelMutation((id) => noShowBooking(id), { success: 'عدم حضور ثبت شد', onSuccess: () => setNoShowTarget(null) });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (bookings.data?.rows || []).filter((b) => {
      if (tab === 'open' ? b.status !== 'pending' && b.status !== 'confirmed' : tab !== 'all' && b.status !== tab) return false;
      if (staff && String(b.resource) !== staff) return false;
      if (day && dayKey(b.startsAt) !== day) return false;
      if (q && !`${b.customerName} ${phoneLabel(b.customerPhone)}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const asc = tab === 'open' || tab === 'pending' || tab === 'confirmed';
    return list.sort((a, b) => (asc ? 1 : -1) * (new Date(a.startsAt) - new Date(b.startsAt)));
  }, [bookings.data, tab, staff, day, query]);
  const counts = useMemo(() => {
    const all = bookings.data?.rows || [];
    return {
      open: all.filter((b) => b.status === 'pending' || b.status === 'confirmed').length,
      all: all.length,
      ...Object.fromEntries(Object.keys(STATUS_LABELS).map((s) => [s, all.filter((b) => b.status === s).length])),
    };
  }, [bookings.data]);
  const today = todayKey();

  const columns = [
    {
      key: 'customer',
      header: 'مشتری',
      primary: true,
      cell: (b) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{b.customerName}</p>
          <p dir="ltr" className="text-start text-xs text-muted-foreground">
            {phoneLabel(b.customerPhone)}
          </p>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'زمان',
      cell: (b) => (
        <div className="whitespace-nowrap">
          <p className="font-medium">{dayKey(b.startsAt) === today ? 'امروز' : jalaliMid(b.startsAt)}</p>
          <p className="text-xs text-muted-foreground">
            {timeLabel(b.startsAt)} تا {timeLabel(b.endsAt)}
          </p>
        </div>
      ),
    },
    { key: 'service', header: 'خدمت', cell: (b) => lookups.services.get(String(b.service))?.name || '—' },
    { key: 'staff', header: 'همکار', cell: (b) => lookups.resources.get(String(b.resource))?.name || '—' },
    { key: 'source', header: 'منبع', hideOnMobile: true, cell: (b) => <span className="text-xs text-muted-foreground">{SOURCE_LABELS[b.source] || '—'}</span> },
    { key: 'status', header: 'وضعیت', cell: (b) => <StatusBadge status={b.status} /> },
    {
      key: 'actions',
      header: 'عملیات',
      cell: (b) => (
        <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
          {b.status === 'pending' && (
            <button type="button" className={cn(btn.primary, btn.sm)} disabled={confirm.isPending} onClick={() => confirm.mutate(idOf(b))}>
              تأیید
            </button>
          )}
          {b.status === 'confirmed' && (
            <>
              <button type="button" className={cn(btn.primary, btn.sm)} disabled={complete.isPending} onClick={() => complete.mutate(idOf(b))}>
                انجام شد
              </button>
              <button type="button" className={cn(btn.dangerOutline, btn.sm)} onClick={() => setNoShowTarget(b)}>
                عدم حضور
              </button>
            </>
          )}
          <button type="button" className={cn(btn.outline, btn.sm)} onClick={() => setSelected(b)}>
            جزئیات
          </button>
        </div>
      ),
    },
  ];

  return (
    <PanelShell title="نوبت‌ها" description="صف تأیید، پیگیری حضور و تاریخچه">
      <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="وضعیت نوبت">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              setShown(PAGE);
            }}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors',
              tab === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-subtle',
            )}
          >
            {label}
            <span className={cn('rounded-full px-1.5 text-[11px]', tab === key ? 'bg-primary-foreground/20' : 'bg-subtle text-muted-foreground')}>{fa(counts[key] || 0)}</span>
          </button>
        ))}
      </div>

      <div className={cn(card, 'grid grid-cols-2 gap-3 p-3 lg:grid-cols-[1fr_12rem_11rem_auto]')}>
        <Field label="جستجوی نام یا شماره" className="col-span-2 lg:col-span-1">{(id) => <input id={id} className={inputCls} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="مثلاً ۰۹۱۲…" />}</Field>
        <SelectField label="همکار" value={staff} onChange={setStaff} placeholder="همه همکاران" options={lookups.resourceList.map((r) => ({ value: idOf(r), label: r.name }))} />
        <DatePick label="روز" value={day} onChange={setDay} />
        <div className="col-span-2 flex items-end gap-2 lg:col-span-1">
          <button type="button" className={btn.outline} onClick={() => setDay(today)}>
            امروز
          </button>
          <button type="button" className={btn.outline} onClick={() => setDay(addDays(today, 1))}>
            فردا
          </button>
          <button type="button" className={btn.ghost} onClick={() => { setDay(''); setStaff(''); setQuery(''); }} disabled={!day && !staff && !query}>
            پاک‌سازی
          </button>
        </div>
      </div>

      <QueryBoundary
        query={bookings}
        isEmpty={!rows.length}
        empty={<EmptyState title="نوبتی با این فیلترها نیست" hint="فیلترها را تغییر دهید یا از «پذیرش حضوری» نوبت جدید ثبت کنید." />}
      >
        <DataTable caption="فهرست نوبت‌ها" columns={columns} rows={rows.slice(0, shown)} rowKey={(b) => idOf(b)} onRowClick={setSelected} />
        {rows.length > shown && (
          <div className="flex justify-center">
            <button type="button" className={btn.outline} onClick={() => setShown(shown + PAGE)}>
              نمایش {fa(Math.min(PAGE, rows.length - shown))} نوبت بیشتر ({fa(rows.length - shown)} مانده)
            </button>
          </div>
        )}
        {(bookings.data?.total || 0) > (bookings.data?.rows.length || 0) && (
          <p className="text-center text-xs text-muted-foreground">فقط {fa(bookings.data.rows.length)} نوبت آخر از {fa(bookings.data.total)} نوبت بارگذاری شده است.</p>
        )}
      </QueryBoundary>

      {selected && <BookingDrawer booking={selected} lookups={lookups} onClose={() => setSelected(null)} />}
      <ConfirmDialog
        open={Boolean(noShowTarget)}
        onOpenChange={(open) => !open && setNoShowTarget(null)}
        title="ثبت عدم حضور"
        description={noShowTarget ? `عدم حضور «${noShowTarget.customerName}» ثبت می‌شود و در سابقه او شمرده خواهد شد. این کار قابل بازگشت نیست.` : ''}
        confirmLabel="ثبت عدم حضور"
        pending={noShow.isPending}
        onConfirm={() => noShow.mutate(idOf(noShowTarget))}
      />
    </PanelShell>
  );
}
