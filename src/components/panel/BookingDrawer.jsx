import { useState } from 'react';
import { Phone } from 'lucide-react';
import {
  cancelBooking,
  checkInBooking,
  completeBooking,
  confirmBooking,
  getCalendar,
  noShowBooking,
  rescheduleBooking,
} from '@/api/backoffice/bookings';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { usePanelMutation, usePanelQuery } from './data';
import { addDays, dateTimeLabel, fa, idOf, isOpenStatus, jalaliLong, phoneLabel, timeLabel, todayKey, PAYMENT_LABELS, SOURCE_LABELS, rangeOf, tomanLabel } from './format';
import { unwrapCalendar, useIsDesktop } from './hooks';
import { btn, inputCls, textareaCls } from './styles';
import { ConfirmDialog, Field, LoadingState, SelectField, StatusBadge } from './ui';

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end font-medium">{children}</dd>
    </div>
  );
}

function ReschedulePicker({ booking, value, onChange }) {
  const resourceId = String(booking.resource || '');
  const slots = usePanelQuery(['reschedule-slots', resourceId, String(booking.service || '')], async () => {
    const range = rangeOf(todayKey(), addDays(todayKey(), 14));
    const now = Date.now();
    return unwrapCalendar(await getCalendar({ ...range, resourceId, limit: 1000 })).slots.filter(
      (s) => s.available && new Date(s.startsAt).getTime() > now && String(s.service || '') === String(booking.service || ''),
    );
  });
  if (slots.isLoading) return <LoadingState rows={1} />;
  const options = (slots.data || []).slice(0, 80).map((s) => ({ value: idOf(s), label: dateTimeLabel(s.startsAt) }));
  if (slots.isError || !options.length)
    return <p className="text-sm text-muted-foreground">زمان آزادی برای این همکار و خدمت در دو هفته آینده پیدا نشد.</p>;
  return <SelectField label="زمان جدید" value={value} onChange={onChange} options={options} placeholder="انتخاب زمان آزاد…" />;
}

/**
 * Appointment details + every staff action. `lookups` carries the id → row maps
 * (`services`, `resources`, `clients`) the parent already loaded.
 */
export default function BookingDrawer({ booking, onClose, lookups }) {
  const desktop = useIsDesktop();
  const [dialog, setDialog] = useState(null); // 'noShow' | 'cancel' | 'reschedule'
  const [reason, setReason] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const id = idOf(booking);
  const done = () => {
    setDialog(null);
    setReason('');
    setNewSlot('');
    onClose();
  };
  const confirm = usePanelMutation(() => confirmBooking(id), { success: 'نوبت تأیید شد', onSuccess: done });
  const checkIn = usePanelMutation(() => checkInBooking(id), { success: 'حضور مشتری ثبت شد', onSuccess: done });
  const complete = usePanelMutation(() => completeBooking(id), { success: 'نوبت به‌عنوان انجام‌شده ثبت شد', onSuccess: done });
  const noShow = usePanelMutation(() => noShowBooking(id), { success: 'عدم حضور ثبت شد', onSuccess: done });
  const cancel = usePanelMutation(() => cancelBooking(id, { reason: reason.trim() || 'لغو توسط پذیرش' }), { success: 'نوبت لغو شد', onSuccess: done });
  const reschedule = usePanelMutation(() => rescheduleBooking(id, { newSlotId: newSlot, reason: reason.trim() || undefined }), { success: 'نوبت جابه‌جا شد', onSuccess: done });
  const busy = [confirm, checkIn, complete, noShow, cancel, reschedule].some((m) => m.isPending);

  const service = lookups.services.get(String(booking.service));
  const resource = lookups.resources.get(String(booking.resource));
  const client = lookups.clients.get(String(booking.client));
  const open = isOpenStatus(booking.status);
  const minutes = Math.round((new Date(booking.endsAt) - new Date(booking.startsAt)) / 60000);

  return (
    <>
      <Sheet open onOpenChange={(next) => !next && !busy && onClose()} direction={desktop ? 'left' : 'bottom'}>
        <SheetContent dir="rtl" className="overflow-y-auto sm:max-w-md md:w-[26rem]">
          <SheetHeader>
            <div className="flex items-center justify-between gap-2">
              <SheetTitle className="truncate">{booking.customerName}</SheetTitle>
              <StatusBadge status={booking.status} />
            </div>
            <SheetDescription className="sr-only">جزئیات نوبت و عملیات</SheetDescription>
            {booking.customerPhone && (
              <a dir="ltr" href={`tel:${phoneLabel(booking.customerPhone)}`} className="inline-flex items-center gap-2 self-start text-sm text-primary underline">
                <Phone className="size-4" aria-hidden="true" />
                {phoneLabel(booking.customerPhone)}
              </a>
            )}
          </SheetHeader>

          <dl>
            <Row label="خدمت">{service?.name || '—'}</Row>
            <Row label="همکار">{resource?.name || '—'}</Row>
            <Row label="تاریخ">{jalaliLong(booking.startsAt)}</Row>
            <Row label="ساعت">
              {timeLabel(booking.startsAt)} تا {timeLabel(booking.endsAt)} ({fa(minutes)} دقیقه)
            </Row>
            <Row label="مبلغ">{tomanLabel(booking.price ?? booking.totalPrice, service?.currency)}</Row>
            <Row label="پرداخت">{PAYMENT_LABELS[booking.paymentStatus] || '—'}</Row>
            <Row label="منبع ثبت">{SOURCE_LABELS[booking.source] || '—'}</Row>
            {booking.checkedInAt && <Row label="زمان حضور">{timeLabel(booking.checkedInAt)}</Row>}
            {booking.cancelledReason && <Row label="دلیل لغو">{booking.cancelledReason}</Row>}
            {booking.notes && <Row label="یادداشت مشتری">{booking.notes}</Row>}
            {client && (
              <Row label="سابقه مشتری">
                {fa(client.visitCount || 0)} مراجعه · {fa(client.noShowCount || 0)} عدم حضور
                {client.blockedAt && <span className="ms-2 text-destructive">مسدود</span>}
              </Row>
            )}
          </dl>

          {open ? (
            <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
              {booking.status === 'pending' && (
                <button type="button" className={`${btn.primary} col-span-2`} disabled={busy} onClick={() => confirm.mutate()}>
                  تأیید نوبت
                </button>
              )}
              {booking.status === 'confirmed' && (
                <>
                  {!booking.checkedInAt && (
                    <button type="button" className={btn.outline} disabled={busy} onClick={() => checkIn.mutate()}>
                      ثبت حضور
                    </button>
                  )}
                  <button type="button" className={`${btn.primary} ${booking.checkedInAt ? 'col-span-2' : ''}`} disabled={busy} onClick={() => complete.mutate()}>
                    انجام شد
                  </button>
                  <button type="button" className={btn.dangerOutline} disabled={busy} onClick={() => setDialog('noShow')}>
                    عدم حضور
                  </button>
                </>
              )}
              <button type="button" className={btn.outline} disabled={busy} onClick={() => setDialog('reschedule')}>
                جابه‌جایی
              </button>
              <button type="button" className={`${btn.dangerOutline} col-span-2`} disabled={busy} onClick={() => setDialog('cancel')}>
                لغو نوبت
              </button>
            </div>
          ) : (
            <p className="mt-auto pt-2 text-xs text-muted-foreground">این نوبت بسته شده و عملیات دیگری ندارد.</p>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={dialog === 'noShow'}
        onOpenChange={(next) => !next && setDialog(null)}
        title="ثبت عدم حضور"
        description={`عدم حضور «${booking.customerName}» ثبت می‌شود و در سابقه مشتری شمرده خواهد شد. این کار قابل بازگشت نیست.`}
        confirmLabel="ثبت عدم حضور"
        pending={noShow.isPending}
        onConfirm={() => noShow.mutate()}
      />
      <ConfirmDialog
        open={dialog === 'cancel'}
        onOpenChange={(next) => !next && setDialog(null)}
        title="لغو نوبت"
        description={`نوبت «${booking.customerName}» لغو و زمان آن آزاد می‌شود.`}
        confirmLabel="لغو نوبت"
        pending={cancel.isPending}
        onConfirm={() => cancel.mutate()}
      >
        <Field label="دلیل لغو (اختیاری)">{(fid) => <textarea id={fid} className={textareaCls} maxLength={240} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field>
      </ConfirmDialog>
      <ConfirmDialog
        open={dialog === 'reschedule'}
        onOpenChange={(next) => !next && setDialog(null)}
        title="جابه‌جایی نوبت"
        description="زمان جدید را از بین زمان‌های آزاد همین همکار انتخاب کنید."
        confirmLabel="جابه‌جا کن"
        tone="primary"
        pending={reschedule.isPending}
        confirmDisabled={!newSlot}
        onConfirm={() => reschedule.mutate()}
      >
        <ReschedulePicker booking={booking} value={newSlot} onChange={setNewSlot} />
        <Field label="دلیل (اختیاری)">{(fid) => <input id={fid} className={inputCls} maxLength={240} value={reason} onChange={(e) => setReason(e.target.value)} />}</Field>
      </ConfirmDialog>
    </>
  );
}
