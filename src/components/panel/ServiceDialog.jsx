import { useState } from 'react';
import { createService, updateService } from '@/api/backoffice/bookings';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { usePanelMutation } from './data';
import { fa, fromToman, idOf, num, toToman } from './format';
import { btn, inputCls, textareaCls } from './styles';
import { Field, Spinner } from './ui';

const init = (service) => {
  const pkg = service?.package || {};
  return {
    name: service?.name || '',
    group: service?.group || '',
    description: service?.description || '',
    durationMinutes: String(service?.durationMinutes ?? 30),
    bufferAfterMinutes: String(service?.bufferAfterMinutes ?? 0),
    price: String(toToman(service?.price ?? 0, service?.currency)),
    color: service?.color || '#0f766e',
    autoConfirm: service?.autoConfirm ?? false,
    active: service?.active ?? true,
    resourceIds: (service?.resourceIds || []).map(String),
    pkgEnabled: Boolean(pkg.enabled),
    pkgName: pkg.name || '',
    pkgSessions: String(pkg.sessionCount ?? 4),
    pkgPrice: String(toToman(pkg.price ?? 0, service?.currency)),
    pkgDays: String(pkg.validityDays ?? 90),
  };
};

/** Create or edit one service, including its optional prepaid-package configuration. */
export default function ServiceDialog({ service, resources, onClose }) {
  const [f, setF] = useState(() => init(service));
  const set = (key) => (value) => setF((prev) => ({ ...prev, [key]: value }));
  const text = (key) => ({ value: f[key], onChange: (e) => set(key)(e.target.value) });
  const duration = num(f.durationMinutes);
  const price = num(f.price);
  const sessions = num(f.pkgSessions);
  const pkgPrice = num(f.pkgPrice);
  const valid =
    f.name.trim() &&
    Number.isInteger(duration) && duration >= 5 &&
    Number.isFinite(price) && price >= 0 &&
    (!f.pkgEnabled || (Number.isInteger(sessions) && sessions >= 1 && Number.isFinite(pkgPrice) && pkgPrice >= 0));
  const currency = service?.currency || 'IRR';

  const save = usePanelMutation(
    () => {
      const body = {
        name: f.name.trim(),
        group: f.group.trim() || undefined,
        description: f.description.trim() || undefined,
        durationMinutes: duration,
        bufferAfterMinutes: Math.max(0, num(f.bufferAfterMinutes) || 0),
        price: fromToman(price, currency),
        currency,
        color: f.color,
        autoConfirm: f.autoConfirm,
        active: f.active,
        resourceIds: f.resourceIds,
        package: f.pkgEnabled
          ? {
              ...(service?.package || {}),
              enabled: true,
              name: f.pkgName.trim() || `بسته ${fa(sessions)} جلسه‌ای ${f.name.trim()}`,
              sessionCount: sessions,
              price: fromToman(pkgPrice, currency),
              validityDays: num(f.pkgDays) > 0 ? num(f.pkgDays) : undefined,
            }
          : { ...(service?.package || {}), enabled: false },
      };
      return service ? updateService(idOf(service), body) : createService(body);
    },
    { success: service ? 'خدمت ذخیره شد' : 'خدمت اضافه شد', onSuccess: onClose },
  );

  return (
    <Dialog open onOpenChange={(open) => !open && !save.isPending && onClose()}>
      <DialogContent dir="rtl" className="max-h-[92dvh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? `ویرایش ${service.name}` : 'خدمت جدید'}</DialogTitle>
          <DialogDescription>قیمت‌ها به تومان وارد می‌شوند.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="نام خدمت" className="sm:col-span-2">{(id) => <input id={id} className={inputCls} maxLength={160} {...text('name')} />}</Field>
          <Field label="دسته">{(id) => <input id={id} className={inputCls} {...text('group')} />}</Field>
          <Field label="رنگ در تقویم">{(id) => <input id={id} type="color" className={`${inputCls} p-1`} {...text('color')} />}</Field>
          <Field label="مدت (دقیقه)">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...text('durationMinutes')} />}</Field>
          <Field label="فاصله بعد از خدمت (دقیقه)">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...text('bufferAfterMinutes')} />}</Field>
          <Field label="قیمت (تومان)" className="sm:col-span-2">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...text('price')} />}</Field>
          <Field label="توضیح" className="sm:col-span-2">{(id) => <textarea id={id} className={textareaCls} {...text('description')} />}</Field>

          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 text-xs font-medium text-muted-foreground">همکاران ارائه‌دهنده</legend>
            <div className="flex flex-wrap gap-2">
              {resources.map((r) => {
                const on = f.resourceIds.includes(idOf(r));
                return (
                  <label key={idOf(r)} className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${on ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <input type="checkbox" checked={on} onChange={() => set('resourceIds')(on ? f.resourceIds.filter((x) => x !== idOf(r)) : [...f.resourceIds, idOf(r)])} />
                    {r.name}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <span className="text-sm">تأیید خودکار نوبت</span>
            <Switch checked={f.autoConfirm} onCheckedChange={set('autoConfirm')} aria-label="تأیید خودکار" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <span className="text-sm">فعال (قابل رزرو)</span>
            <Switch checked={f.active} onCheckedChange={set('active')} aria-label="فعال" />
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">بسته چندجلسه‌ای</span>
              <Switch checked={f.pkgEnabled} onCheckedChange={set('pkgEnabled')} aria-label="بسته چندجلسه‌ای" />
            </div>
            {f.pkgEnabled && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="نام بسته" className="sm:col-span-2">{(id) => <input id={id} className={inputCls} placeholder={`بسته ${f.name}`} {...text('pkgName')} />}</Field>
                <Field label="تعداد جلسه">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...text('pkgSessions')} />}</Field>
                <Field label="قیمت بسته (تومان)">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...text('pkgPrice')} />}</Field>
                <Field label="اعتبار (روز)">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...text('pkgDays')} />}</Field>
              </div>
            )}
          </div>
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
