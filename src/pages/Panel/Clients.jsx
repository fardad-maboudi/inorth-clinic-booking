import { useMemo, useState } from 'react';
import { Phone } from 'lucide-react';
import BookingDrawer from '@/components/panel/BookingDrawer';
import CreditList from '@/components/panel/CreditList';
import GrantCreditDialog from '@/components/panel/GrantCreditDialog';
import PanelShell from '@/components/panel/PanelShell';
import { rec, useBookings, useClientCredits, useClients, useLookups, usePanelMutation } from '@/components/panel/data';
import { dateTimeLabel, fa, idOf, jalaliShort, phoneLabel } from '@/components/panel/format';
import { useIsDesktop } from '@/components/panel/hooks';
import { btn, inputCls, textareaCls } from '@/components/panel/styles';
import { ConfirmDialog, DataTable, EmptyState, Field, QueryBoundary, StatusBadge } from '@/components/panel/ui';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5 text-center">
      <p className={cn('text-lg font-bold', tone)}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ClientDrawer({ client, lookups, bookings, onClose, onOpenBooking }) {
  const desktop = useIsDesktop();
  const id = idOf(client);
  const [notes, setNotes] = useState(client.notes || '');
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [grantOpen, setGrantOpen] = useState(false);
  const credits = useClientCredits(id);
  const saveNotes = usePanelMutation(() => rec('booking_client').update(id, { notes }), { success: 'یادداشت ذخیره شد' });
  const blocked = Boolean(client.blockedAt);
  const toggleBlock = usePanelMutation(
    () => rec('booking_client').update(id, blocked ? { blockedAt: null, blockedReason: null } : { blockedAt: new Date().toISOString(), blockedReason: blockReason.trim() || 'مسدود توسط پذیرش' }),
    { success: blocked ? 'مسدودیت برداشته شد' : 'مشتری مسدود شد', onSuccess: () => { setBlockOpen(false); onClose(); } },
  );
  const visits = bookings.filter((b) => String(b.client) === id).sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));

  return (
    <>
      <Sheet open onOpenChange={(next) => !next && onClose()} direction={desktop ? 'left' : 'bottom'}>
        <SheetContent dir="rtl" className="overflow-y-auto sm:max-w-md md:w-[28rem]">
          <SheetHeader>
            <div className="flex items-center justify-between gap-2">
              <SheetTitle className="truncate">{client.fullName}</SheetTitle>
              {blocked && <StatusBadge label="مسدود" tone="bad" />}
            </div>
            <SheetDescription className="sr-only">پرونده مشتری</SheetDescription>
            {client.phoneNumber && (
              <a dir="ltr" href={`tel:${phoneLabel(client.phoneNumber)}`} className="inline-flex items-center gap-2 self-start text-sm text-primary underline">
                <Phone className="size-4" aria-hidden="true" />
                {phoneLabel(client.phoneNumber)}
              </a>
            )}
          </SheetHeader>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="مراجعه" value={fa(client.visitCount || 0)} />
            <Stat label="عدم حضور" value={fa(client.noShowCount || 0)} tone={client.noShowCount ? 'text-rose-700' : ''} />
            <Stat label="آخرین مراجعه" value={client.lastVisitAt ? jalaliShort(client.lastVisitAt) : '—'} />
          </div>
          {blocked && <p className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">دلیل مسدودی: {client.blockedReason || '—'}. این مشتری نمی‌تواند نوبت بگیرد.</p>}

          <section className="space-y-2">
            <div role="heading" aria-level={3} className="text-sm font-bold">یادداشت پذیرش</div>
            <textarea className={textareaCls} value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} placeholder="حساسیت‌ها، ترجیحات، توضیحات داخلی…" aria-label="یادداشت پذیرش" />
            <button type="button" className={cn(btn.outline, btn.sm)} disabled={saveNotes.isPending || notes === (client.notes || '')} onClick={() => saveNotes.mutate()}>
              ذخیره یادداشت
            </button>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <div role="heading" aria-level={3} className="text-sm font-bold">اعتبار جلسات</div>
              <button type="button" className={cn(btn.primary, btn.sm)} onClick={() => setGrantOpen(true)}>
                افزودن اعتبار
              </button>
            </div>
            {credits.isLoading ? (
              <div className="pn-shimmer h-12 rounded-lg" />
            ) : credits.isError ? (
              <p className="text-xs text-destructive">{credits.error?.message || 'دریافت اعتبارها انجام نشد'}</p>
            ) : credits.data?.length ? (
              <CreditList credits={credits.data} services={lookups.services} />
            ) : (
              <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">این مشتری اعتباری ندارد.</p>
            )}
          </section>

          <section className="space-y-2">
            <div role="heading" aria-level={3} className="text-sm font-bold">سابقه نوبت‌ها</div>
            {visits.length ? (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {visits.slice(0, 12).map((b) => (
                  <li key={idOf(b)}>
                    <button type="button" className="flex w-full items-center justify-between gap-2 p-2.5 text-start text-sm hover:bg-subtle" onClick={() => onOpenBooking(b)}>
                      <span className="min-w-0">
                        <span className="block truncate">{lookups.services.get(String(b.service))?.name || 'خدمت'}</span>
                        <span className="block text-xs text-muted-foreground">{dateTimeLabel(b.startsAt)}</span>
                      </span>
                      <StatusBadge status={b.status} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">نوبتی ثبت نشده است.</p>
            )}
          </section>

          <button type="button" className={cn(blocked ? btn.outline : btn.dangerOutline, 'mt-auto')} onClick={() => (blocked ? toggleBlock.mutate() : setBlockOpen(true))} disabled={toggleBlock.isPending}>
            {blocked ? 'برداشتن مسدودیت' : 'مسدود کردن مشتری'}
          </button>
        </SheetContent>
      </Sheet>
      {grantOpen && <GrantCreditDialog client={client} services={lookups.serviceList} onClose={() => setGrantOpen(false)} />}
      <ConfirmDialog
        open={blockOpen}
        onOpenChange={setBlockOpen}
        title="مسدود کردن مشتری"
        description={`«${client.fullName}» دیگر نمی‌تواند نوبت جدید رزرو کند. هر زمان می‌توانید مسدودیت را بردارید.`}
        confirmLabel="مسدود کن"
        pending={toggleBlock.isPending}
        onConfirm={() => toggleBlock.mutate()}
      >
        <Field label="دلیل (اختیاری)">{(fid) => <input id={fid} className={inputCls} maxLength={240} value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />}</Field>
      </ConfirmDialog>
    </>
  );
}

export default function PanelClients() {
  const clients = useClients(500);
  const bookings = useBookings(500);
  const lookups = useLookups();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(null);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (clients.data || [])
      .filter((c) => (filter === 'blocked' ? c.blockedAt : filter === 'noshow' ? c.noShowCount > 0 : true))
      .filter((c) => !q || `${c.fullName} ${phoneLabel(c.phoneNumber)}`.toLowerCase().includes(q))
      .sort((a, b) => String(a.fullName).localeCompare(String(b.fullName), 'fa'));
  }, [clients.data, query, filter]);
  const selectedFresh = selected && (clients.data || []).find((c) => idOf(c) === idOf(selected)) || selected;

  const columns = [
    { key: 'name', header: 'نام', primary: true, cell: (c) => <span className="font-medium">{c.fullName}{c.blockedAt && <StatusBadge className="ms-2" label="مسدود" tone="bad" />}</span> },
    { key: 'phone', header: 'موبایل', cell: (c) => <span dir="ltr" className="inline-block text-start">{phoneLabel(c.phoneNumber) || '—'}</span> },
    { key: 'visits', header: 'مراجعه', cell: (c) => fa(c.visitCount || 0) },
    { key: 'noshow', header: 'عدم حضور', cell: (c) => <span className={c.noShowCount ? 'font-bold text-rose-700' : ''}>{fa(c.noShowCount || 0)}</span> },
    { key: 'last', header: 'آخرین مراجعه', hideOnMobile: true, cell: (c) => (c.lastVisitAt ? jalaliShort(c.lastVisitAt) : '—') },
    { key: 'since', header: 'عضویت', hideOnMobile: true, cell: (c) => jalaliShort(c.created_at) },
  ];

  return (
    <PanelShell title="مشتریان" description="پرونده، سابقه مراجعه، اعتبار و مسدودسازی">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="جستجوی نام یا شماره" className="min-w-52 flex-1">{(id) => <input id={id} className={inputCls} value={query} onChange={(e) => setQuery(e.target.value)} />}</Field>
        <div className="flex gap-1.5" role="tablist" aria-label="فیلتر مشتریان">
          {[['all', 'همه'], ['noshow', 'دارای عدم حضور'], ['blocked', 'مسدودشده']].map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)} className={cn('h-10 rounded-lg border px-3 text-sm font-medium', filter === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-subtle')}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <QueryBoundary query={clients} isEmpty={!rows.length} empty={<EmptyState title="مشتری‌ای پیدا نشد" hint="مشتریان با اولین رزرو یا ثبت حضوری به‌طور خودکار ساخته می‌شوند." />}>
        <DataTable caption="فهرست مشتریان" columns={columns} rows={rows} rowKey={(c) => idOf(c)} onRowClick={setSelected} />
        <p className="text-center text-xs text-muted-foreground">{fa(rows.length)} مشتری</p>
      </QueryBoundary>
      {selectedFresh && !booking && <ClientDrawer key={idOf(selectedFresh)} client={selectedFresh} lookups={lookups} bookings={bookings.data?.rows || []} onClose={() => setSelected(null)} onOpenBooking={setBooking} />}
      {booking && <BookingDrawer booking={booking} lookups={lookups} onClose={() => setBooking(null)} />}
    </PanelShell>
  );
}
