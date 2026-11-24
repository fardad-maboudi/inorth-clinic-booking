import { useMemo, useState } from 'react';
import { CheckCircle2, Printer } from 'lucide-react';
import { createWalkIn } from '@/api/backoffice/bookings';
import BookingDrawer from '@/components/panel/BookingDrawer';
import PanelShell from '@/components/panel/PanelShell';
import { useBookings, useLookups, usePanelMutation } from '@/components/panel/data';
import { dayKey, fa, fromToman, idOf, jalaliLong, num, phoneLabel, timeLabel, todayKey, toEnDigits, toToman, tomanLabel } from '@/components/panel/format';
import { btn, card, inputCls, textareaCls } from '@/components/panel/styles';
import { Card, EmptyState, Field, SectionTitle, SelectField, Spinner, StatusBadge } from '@/components/panel/ui';
import { cn } from '@/lib/utils';

function Receipt({ booking, service, resource, onNew }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="size-6" aria-hidden="true" />
        <div role="heading" aria-level={2} className="text-base font-bold">نوبت حضوری ثبت شد</div>
      </div>
      <div className="rounded-lg border border-dashed border-border bg-background p-4 text-sm">
        <p className="mb-3 text-center text-xs text-muted-foreground">رسید پذیرش · {jalaliLong(booking.startsAt)}</p>
        <dl className="space-y-2">
          {[
            ['مشتری', booking.customerName],
            ['موبایل', booking.customerPhone ? <span key="p" dir="ltr">{phoneLabel(booking.customerPhone)}</span> : '—'],
            ['خدمت', service?.name || '—'],
            ['همکار', resource?.name || '—'],
            ['شروع', `${timeLabel(booking.startsAt)} تا ${timeLabel(booking.endsAt)}`],
            ['مبلغ', tomanLabel(booking.price ?? booking.totalPrice, service?.currency)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex gap-2">
        <button type="button" className={cn(btn.primary, 'flex-1')} onClick={onNew}>
          ثبت مشتری بعدی
        </button>
        <button type="button" className={btn.outline} onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden="true" />
          چاپ
        </button>
      </div>
    </Card>
  );
}

export default function PanelPos() {
  const lookups = useLookups();
  const bookings = useBookings(200);
  const [serviceId, setServiceId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [selected, setSelected] = useState(null);

  const services = lookups.serviceList.filter((s) => s.active !== false);
  const service = lookups.services.get(serviceId);
  const staff = useMemo(
    () => lookups.resourceList.filter((r) => r.active !== false && (!service?.resourceIds?.length || service.resourceIds.map(String).includes(idOf(r)))),
    [lookups.resourceList, service],
  );
  const defaultPrice = service ? String(toToman(service.price, service.currency)) : '';
  const shownPrice = price === '' ? defaultPrice : price;
  const amount = num(shownPrice);
  const phoneEn = toEnDigits(phone).replace(/[\s-]/g, '');
  const phoneOk = !phone.trim() || /^(\+?98|0)?9\d{9}$/.test(phoneEn);
  const valid = name.trim() && serviceId && resourceId && Number.isFinite(amount) && amount >= 0 && phoneOk;

  const walkIn = usePanelMutation(
    () =>
      createWalkIn({
        serviceId,
        resourceId,
        customerName: name.trim(),
        ...(phone.trim() ? { customerPhone: phoneEn } : {}),
        price: fromToman(amount, service?.currency),
        durationMinutes: service?.durationMinutes || 30,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    {
      success: 'نوبت حضوری ثبت شد',
      onSuccess: (result) => setReceipt(result?.customerName ? result : result?.data || result),
    },
  );

  const reset = () => {
    setReceipt(null);
    setName('');
    setPhone('');
    setPrice('');
    setNotes('');
  };
  const today = todayKey();
  const todays = (bookings.data?.rows || [])
    .filter((b) => b.source === 'walk_in' && dayKey(b.startsAt) === today)
    .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
  const total = todays.reduce((sum, b) => sum + toToman(b.price ?? b.totalPrice), 0);

  return (
    <PanelShell title="پذیرش حضوری" description="ثبت فوری مشتری بدون نوبت قبلی؛ زمان شروع همین حالا است">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_1fr]">
        {receipt ? (
          <Receipt booking={receipt} service={lookups.services.get(String(receipt.service))} resource={lookups.resources.get(String(receipt.resource))} onNew={reset} />
        ) : (
          <Card>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (valid && !walkIn.isPending) walkIn.mutate();
              }}
            >
              <SelectField
                label="خدمت"
                value={serviceId}
                onChange={(v) => {
                  setServiceId(v);
                  setResourceId('');
                  setPrice('');
                }}
                placeholder="انتخاب خدمت…"
                options={services.map((s) => ({ value: idOf(s), label: `${s.name} — ${fa(toToman(s.price, s.currency))} تومان` }))}
              />
              <SelectField label="همکار" value={resourceId} onChange={setResourceId} placeholder={serviceId ? 'انتخاب همکار…' : 'ابتدا خدمت را انتخاب کنید'} disabled={!serviceId} options={staff.map((r) => ({ value: idOf(r), label: r.name }))} />
              <Field label="نام مشتری">{(id) => <input id={id} className={inputCls} value={name} maxLength={200} onChange={(e) => setName(e.target.value)} autoComplete="off" />}</Field>
              <Field label="موبایل (اختیاری)" hint={!phoneOk ? 'شماره موبایل معتبر نیست' : undefined}>
                {(id) => <input id={id} dir="ltr" inputMode="tel" className={cn(inputCls, 'text-start', !phoneOk && 'border-destructive')} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09121234567" />}
              </Field>
              <Field label="مبلغ (تومان)" hint={service ? `قیمت پایه ${fa(toToman(service.price, service.currency))} تومان؛ برای تخفیف ویرایش کنید` : undefined}>
                {(id) => <input id={id} inputMode="numeric" className={inputCls} value={shownPrice} onChange={(e) => setPrice(e.target.value)} />}
              </Field>
              <Field label="یادداشت (اختیاری)">{(id) => <textarea id={id} className={textareaCls} value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} />}</Field>
              <button type="submit" className={btn.primary} disabled={!valid || walkIn.isPending}>
                {walkIn.isPending && <Spinner />}
                ثبت نوبت حضوری
              </button>
            </form>
          </Card>
        )}

        <Card>
          <SectionTitle title="مراجعه‌های حضوری امروز" hint={todays.length ? `${fa(todays.length)} مورد · جمع ${fa(total)} تومان` : undefined} />
          {bookings.isLoading ? (
            <div className="pn-shimmer h-24 rounded-lg" />
          ) : todays.length ? (
            <ul className={cn(card, 'divide-y divide-border border-0')}>
              {todays.map((b) => (
                <li key={idOf(b)}>
                  <button type="button" onClick={() => setSelected(b)} className="flex w-full items-center gap-3 px-1 py-2.5 text-start hover:bg-subtle">
                    <span className="w-12 shrink-0 text-sm font-bold">{timeLabel(b.startsAt)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{b.customerName}</span>
                      <span className="block truncate text-xs text-muted-foreground">{lookups.services.get(String(b.service))?.name} · {lookups.resources.get(String(b.resource))?.name}</span>
                    </span>
                    <span className="text-xs">{tomanLabel(b.price ?? b.totalPrice, lookups.services.get(String(b.service))?.currency)}</span>
                    <StatusBadge status={b.status} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="هنوز مراجعه حضوری ثبت نشده" hint="پس از ثبت، مشتری اینجا و در تقویم همکار دیده می‌شود." />
          )}
        </Card>
      </div>
      {selected && <BookingDrawer booking={selected} lookups={lookups} onClose={() => setSelected(null)} />}
    </PanelShell>
  );
}
