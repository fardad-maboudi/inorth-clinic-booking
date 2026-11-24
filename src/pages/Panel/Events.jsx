import { useState } from 'react';
import { cancelEvent, createEvent, listEventRegistrations, updateEvent } from '@/api/backoffice/bookings';
import PanelShell from '@/components/panel/PanelShell';
import { rec, usePanelMutation, usePanelQuery } from '@/components/panel/data';
import { dateTimeLabel, dayKey, fa, fromToman, idOf, isoAt, minutesOfDay, num, phoneLabel, toToman, tomanLabel, todayKey } from '@/components/panel/format';
import { useIsDesktop } from '@/components/panel/hooks';
import { btn, inputCls, textareaCls } from '@/components/panel/styles';
import { ConfirmDialog, DataTable, DatePick, EmptyState, ErrorState, Field, LoadingState, QueryBoundary, SelectField, Spinner, StatusBadge } from '@/components/panel/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const EVENT_STATUS = { scheduled: ['برگزار می‌شود', 'good'], cancelled: ['لغوشده', 'neutral'], completed: ['برگزارشده', 'neutral'], draft: ['پیش‌نویس', 'warn'] };
const REG_STATUS = { confirmed: ['تأییدشده', 'good'], pending: ['در انتظار', 'warn'], cancelled: ['لغوشده', 'neutral'] };
const hm = (iso) => {
  const m = minutesOfDay(iso);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const asItems = (r) => {
  const body = r?.data && !Array.isArray(r.data) ? r.data : r;
  return Array.from(Array.isArray(body) ? body : body?.items || body?.registrations || []);
};

function EventDialog({ event, onClose }) {
  const [f, setF] = useState(() => ({
    title: event?.title || '',
    description: event?.description || '',
    place: event?.place || '',
    price: String(event ? toToman(event.price, event.currency) : 0),
    capacity: String(event?.capacity ?? 20),
    date: event ? dayKey(event.startsAt) : todayKey(),
    start: event ? hm(event.startsAt) : '17:00',
    end: event ? hm(event.endsAt) : '19:00',
    weekly: false,
    count: '4',
  }));
  const bind = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const cap = num(f.capacity);
  const price = num(f.price);
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  const valid = f.title.trim() && Number.isInteger(cap) && cap >= 1 && Number.isFinite(price) && price >= 0 && f.date && time.test(f.start) && time.test(f.end) && f.start < f.end;
  const currency = event?.currency || 'IRR';
  const save = usePanelMutation(
    () => {
      const body = {
        title: f.title.trim(),
        description: f.description.trim() || undefined,
        place: f.place.trim() || undefined,
        price: fromToman(price, currency),
        currency,
        capacity: cap,
        startsAt: new Date(isoAt(f.date, f.start)).toISOString(),
        endsAt: new Date(isoAt(f.date, f.end)).toISOString(),
      };
      if (event) return updateEvent(idOf(event), body);
      return createEvent({ ...body, ...(f.weekly ? { recurrence: { frequency: 'weekly', interval: 1, count: Math.max(2, num(f.count) || 4) } } : {}) });
    },
    { success: event ? 'رویداد ذخیره شد' : 'رویداد ساخته شد', onSuccess: onClose },
  );
  return (
    <Dialog open onOpenChange={(open) => !open && !save.isPending && onClose()}>
      <DialogContent dir="rtl" className="max-h-[92dvh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'ویرایش رویداد' : 'رویداد یا کلاس جدید'}</DialogTitle>
          <DialogDescription>قیمت به تومان؛ ساعت‌ها به‌صورت ۱۷:۰۰ (اعداد انگلیسی).</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="عنوان" className="sm:col-span-2">{(id) => <input id={id} className={inputCls} maxLength={200} {...bind('title')} />}</Field>
          <Field label="مکان" className="sm:col-span-2">{(id) => <input id={id} className={inputCls} {...bind('place')} />}</Field>
          <DatePick label="تاریخ" value={f.date} emptyLabel="انتخاب" onChange={(v) => setF({ ...f, date: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="شروع">{(id) => <input id={id} dir="ltr" className={cn(inputCls, 'text-center')} {...bind('start')} />}</Field>
            <Field label="پایان">{(id) => <input id={id} dir="ltr" className={cn(inputCls, 'text-center')} {...bind('end')} />}</Field>
          </div>
          <Field label="قیمت هر نفر (تومان)">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...bind('price')} />}</Field>
          <Field label="ظرفیت">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...bind('capacity')} />}</Field>
          <Field label="توضیح" className="sm:col-span-2">{(id) => <textarea id={id} className={textareaCls} maxLength={3000} {...bind('description')} />}</Field>
          {!event && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={f.weekly} onChange={(e) => setF({ ...f, weekly: e.target.checked })} />
                هر هفته تکرار شود
              </label>
              {f.weekly && (
                <label className="inline-flex items-center gap-2 text-sm">
                  تعداد جلسه
                  <input inputMode="numeric" className={cn(inputCls, 'w-20 text-center')} value={f.count} onChange={(e) => setF({ ...f, count: e.target.value })} />
                </label>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-start">
          <button type="button" className={btn.primary} disabled={!valid || save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner />}
            ذخیره
          </button>
          <button type="button" className={btn.outline} disabled={save.isPending} onClick={onClose}>
            انصراف
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Registrations({ event, onClose }) {
  const desktop = useIsDesktop();
  const regs = usePanelQuery(['event-regs', idOf(event)], async () => asItems(await listEventRegistrations(idOf(event), { limit: 200 })));
  const rows = regs.data || [];
  const seats = rows.filter((r) => r.status !== 'cancelled').reduce((s, r) => s + (r.seats || 1), 0);
  return (
    <Sheet open onOpenChange={(next) => !next && onClose()} direction={desktop ? 'left' : 'bottom'}>
      <SheetContent dir="rtl" className="overflow-y-auto sm:max-w-md md:w-[26rem]">
        <SheetHeader>
          <SheetTitle>{event.title}</SheetTitle>
          <SheetDescription>
            {dateTimeLabel(event.startsAt)} · {fa(seats)} از {fa(event.capacity)} جا پر شده
          </SheetDescription>
        </SheetHeader>
        {regs.isLoading ? (
          <LoadingState rows={3} />
        ) : regs.isError ? (
          <ErrorState error={regs.error} onRetry={() => void regs.refetch()} />
        ) : rows.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {rows.map((r) => {
              const [label, tone] = REG_STATUS[r.status] || [r.status, 'neutral'];
              return (
                <li key={idOf(r)} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.customerName}</p>
                    <p dir="ltr" className="text-start text-xs text-muted-foreground">{phoneLabel(r.customerPhone)} · {fa(r.seats || 1)} نفر</p>
                  </div>
                  <StatusBadge label={label} tone={tone} />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="هنوز ثبت‌نامی نیست" hint="ثبت‌نام‌ها پس از رزرو مشتریان از سایت اینجا دیده می‌شوند." />
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function PanelEvents() {
  const events = usePanelQuery(['events'], async () => Array.from(await rec('booking_event').list({ limit: 100, sort: '-startsAt' })));
  const [dialog, setDialog] = useState(null);
  const [regs, setRegs] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [reason, setReason] = useState('');
  const [series, setSeries] = useState(false);
  const cancel = usePanelMutation(() => cancelEvent(idOf(cancelling), { reason: reason.trim() || 'لغو توسط مدیر', cancelSeries: series }), {
    success: 'رویداد لغو شد',
    onSuccess: () => { setCancelling(null); setReason(''); setSeries(false); },
  });
  const rows = events.data || [];
  const columns = [
    { key: 'title', header: 'رویداد', primary: true, cell: (e) => <span className="font-medium">{e.title}</span> },
    { key: 'when', header: 'زمان', cell: (e) => <span className="whitespace-nowrap">{dateTimeLabel(e.startsAt)}</span> },
    { key: 'place', header: 'مکان', hideOnMobile: true, cell: (e) => e.place || '—' },
    { key: 'price', header: 'قیمت', cell: (e) => tomanLabel(e.price, e.currency) },
    { key: 'seats', header: 'ظرفیت', cell: (e) => `${fa(e.registered ?? (e.capacity || 0) - (e.seatsRemaining ?? e.capacity ?? 0))} از ${fa(e.capacity)}` },
    { key: 'st', header: 'وضعیت', cell: (e) => <StatusBadge label={(EVENT_STATUS[e.status] || [e.status])[0]} tone={(EVENT_STATUS[e.status] || [])[1] || 'neutral'} /> },
    {
      key: 'act',
      header: 'عملیات',
      cell: (e) => (
        <div className="flex flex-wrap gap-1.5" onClick={(ev) => ev.stopPropagation()}>
          <button type="button" className={cn(btn.outline, btn.sm)} onClick={() => setRegs(e)}>ثبت‌نام‌ها</button>
          {e.status !== 'cancelled' && (
            <>
              <button type="button" className={cn(btn.outline, btn.sm)} onClick={() => setDialog({ event: e })}>ویرایش</button>
              <button type="button" className={cn(btn.dangerOutline, btn.sm)} onClick={() => setCancelling(e)}>لغو</button>
            </>
          )}
        </div>
      ),
    },
  ];
  return (
    <PanelShell
      title="رویدادها و کلاس‌ها"
      description="کارگاه، کلاس و رویدادهای ظرفیت‌دار"
      actions={<button type="button" className={btn.primary} onClick={() => setDialog({})}>رویداد جدید</button>}
    >
      <QueryBoundary query={events} isEmpty={!rows.length} empty={<EmptyState title="رویدادی ثبت نشده" hint="کارگاه یا کلاس گروهی بسازید تا مشتریان از صفحه رویدادها ثبت‌نام کنند." action={<button type="button" className={btn.primary} onClick={() => setDialog({})}>ساخت اولین رویداد</button>} />}>
        <DataTable caption="رویدادها" columns={columns} rows={rows} rowKey={(e) => idOf(e)} onRowClick={setRegs} />
      </QueryBoundary>
      {dialog && <EventDialog event={dialog.event} onClose={() => setDialog(null)} />}
      {regs && <Registrations event={regs} onClose={() => setRegs(null)} />}
      <ConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && setCancelling(null)}
        title="لغو رویداد"
        description={cancelling ? `«${cancelling.title}» لغو می‌شود و ثبت‌نام‌ها باطل خواهد شد.` : ''}
        confirmLabel="لغو رویداد"
        pending={cancel.isPending}
        onConfirm={() => cancel.mutate()}
      >
        <Field label="دلیل لغو (اختیاری)">{(id) => <input id={id} className={inputCls} maxLength={240} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field>
        {cancelling?.recurrence?.frequency && cancelling.recurrence.frequency !== 'none' && (
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={series} onChange={(e) => setSeries(e.target.checked)} />
            کل سری هفتگی لغو شود
          </label>
        )}
      </ConfirmDialog>
    </PanelShell>
  );
}
