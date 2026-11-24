import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { grantCreditRequest, usePanelMutation } from './data';
import { addDays, idOf, num, todayKey } from './format';
import { btn, inputCls } from './styles';
import { Field, SelectField, Spinner } from './ui';

/** Manual credit grant (used after a paid package order is confirmed, or as goodwill). */
export default function GrantCreditDialog({ client, services, onClose, defaults = {} }) {
  const [serviceId, setServiceId] = useState(defaults.serviceId || '');
  const [sessions, setSessions] = useState(String(defaults.sessions ?? 4));
  const [days, setDays] = useState(String(defaults.days ?? 90));
  const [reason, setReason] = useState(defaults.reason || '');
  const count = num(sessions);
  const validity = num(days);
  const valid = Number.isInteger(count) && count >= 1 && count <= 1000 && (!days || (Number.isInteger(validity) && validity >= 1));
  const grant = usePanelMutation(
    () =>
      grantCreditRequest({
        clientId: idOf(client),
        totalSessions: count,
        serviceIds: serviceId ? [serviceId] : [],
        expiresAt: days ? new Date(`${addDays(todayKey(), validity)}T23:59:59+03:30`).toISOString() : undefined,
        grantReason: reason.trim() || undefined,
      }),
    { success: 'اعتبار جلسات ثبت شد', onSuccess: onClose },
  );
  return (
    <Dialog open onOpenChange={(open) => !open && !grant.isPending && onClose()}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>افزودن اعتبار برای {client.fullName}</DialogTitle>
          <DialogDescription>جلسات به حساب مشتری اضافه می‌شود و هنگام رزرو از آن کسر می‌گردد.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <SelectField
            label="خدمت (اختیاری)"
            value={serviceId}
            onChange={setServiceId}
            placeholder="همه خدمات"
            options={services.map((s) => ({ value: idOf(s), label: s.name }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="تعداد جلسه">{(id) => <input id={id} inputMode="numeric" className={inputCls} value={sessions} onChange={(e) => setSessions(e.target.value)} />}</Field>
            <Field label="اعتبار (روز)" hint="خالی = بدون انقضا">
              {(id) => <input id={id} inputMode="numeric" className={inputCls} value={days} onChange={(e) => setDays(e.target.value)} />}
            </Field>
          </div>
          <Field label="دلیل / شماره سفارش">{(id) => <input id={id} className={inputCls} maxLength={240} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثلاً: پرداخت سفارش بسته ۴ جلسه‌ای" />}</Field>
        </div>
        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-start">
          <button type="button" className={btn.primary} disabled={!valid || grant.isPending} onClick={() => grant.mutate()}>
            {grant.isPending && <Spinner />}
            ثبت اعتبار
          </button>
          <button type="button" className={btn.outline} disabled={grant.isPending} onClick={onClose}>
            انصراف
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
