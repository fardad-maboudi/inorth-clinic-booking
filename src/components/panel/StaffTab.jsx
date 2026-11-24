import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { rec, useSchedules, useSettings, usePanelMutation } from './data';
import { idOf } from './format';
import HoursEditor from './HoursEditor';
import { btn, card, inputCls } from './styles';
import { Card, EmptyState, Field, QueryBoundary, SectionTitle, Spinner, StatusBadge } from './ui';
import { cn } from '@/lib/utils';

function StaffDialog({ resource, onClose }) {
  const [f, setF] = useState({ name: resource?.name || '', title: resource?.title || '', phoneNumber: resource?.phoneNumber || '', color: resource?.color || '#0f766e', active: resource?.active ?? true });
  const bind = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const save = usePanelMutation(
    () => {
      const body = { ...f, name: f.name.trim(), kind: 'staff', capacity: resource?.capacity ?? 1 };
      return resource ? rec('booking_resource').update(idOf(resource), body) : rec('booking_resource').create(body);
    },
    { success: resource ? 'همکار ذخیره شد' : 'همکار اضافه شد', onSuccess: onClose },
  );
  return (
    <Dialog open onOpenChange={(open) => !open && !save.isPending && onClose()}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>{resource ? 'ویرایش همکار' : 'همکار جدید'}</DialogTitle>
          <DialogDescription>پس از افزودن، ساعت کاری او را در همین بخش تعریف کنید.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="نام" className="sm:col-span-2">{(id) => <input id={id} className={inputCls} {...bind('name')} />}</Field>
          <Field label="عنوان / تخصص">{(id) => <input id={id} className={inputCls} {...bind('title')} />}</Field>
          <Field label="موبایل">{(id) => <input id={id} dir="ltr" className={cn(inputCls, 'text-start')} {...bind('phoneNumber')} />}</Field>
          <Field label="رنگ در تقویم">{(id) => <input id={id} type="color" className={`${inputCls} p-1`} {...bind('color')} />}</Field>
          <div className="flex items-end justify-between gap-3 rounded-lg border border-border p-3">
            <span className="text-sm">فعال</span>
            <Switch checked={f.active} onCheckedChange={(v) => setF({ ...f, active: v })} aria-label="فعال" />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-start">
          <button type="button" className={btn.primary} disabled={!f.name.trim() || save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner />}
            ذخیره
          </button>
          <button type="button" className={btn.outline} onClick={onClose} disabled={save.isPending}>
            انصراف
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffTab({ resourcesQuery }) {
  const schedules = useSchedules();
  const settings = useSettings();
  const [picked, setPicked] = useState('');
  const [dialog, setDialog] = useState(null); // { resource? }
  const resources = resourcesQuery.data || [];
  const current = resources.find((r) => idOf(r) === picked) || resources[0];
  const setting = settings.data?.[0];
  const mine = (schedules.data || []).filter((s) => current && String(s.resource) === idOf(current));

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <Card>
        <SectionTitle title="همکاران" actions={<button type="button" className={`${btn.primary} ${btn.sm}`} onClick={() => setDialog({})}>همکار جدید</button>} />
        <QueryBoundary query={resourcesQuery} isEmpty={!resources.length} empty={<EmptyState title="همکاری ثبت نشده" />} rows={3}>
          <ul className="space-y-1.5">
            {resources.map((r) => (
              <li key={idOf(r)}>
                <button type="button" onClick={() => setPicked(idOf(r))} className={cn('flex w-full items-center gap-3 rounded-lg border p-2.5 text-start', current && idOf(current) === idOf(r) ? 'border-primary bg-primary/5' : 'border-border hover:bg-subtle')}>
                  <span className="size-3 shrink-0 rounded-full" style={{ background: r.color }} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.title}</span>
                  </span>
                  {r.active === false && <StatusBadge label="غیرفعال" tone="neutral" />}
                </button>
              </li>
            ))}
          </ul>
        </QueryBoundary>
      </Card>
      <Card className={card}>
        {current ? (
          <>
            <SectionTitle
              title={`ساعت کاری ${current.name}`}
              hint="هر روز می‌تواند چند بازه داشته باشد؛ ساعت‌ها را به‌صورت ۱۰:۰۰ بنویسید."
              actions={<button type="button" className={`${btn.outline} ${btn.sm}`} onClick={() => setDialog({ resource: current })}>ویرایش مشخصات</button>}
            />
            <QueryBoundary query={schedules} rows={4}>
              <HoursEditor key={`${idOf(current)}:${mine.map((s) => `${idOf(s)}${s.startTime}${s.endTime}`).join()}`} resource={current} schedules={mine} horizonDays={setting?.horizonDays || 21} interval={setting?.slotIntervalMinutes || 30} />
            </QueryBoundary>
          </>
        ) : (
          <EmptyState title="یک همکار انتخاب یا اضافه کنید" />
        )}
      </Card>
      {dialog && <StaffDialog resource={dialog.resource} onClose={() => setDialog(null)} />}
    </div>
  );
}
