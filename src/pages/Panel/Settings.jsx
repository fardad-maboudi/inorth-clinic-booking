import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import PanelShell from '@/components/panel/PanelShell';
import { rec, useSettings, usePanelMutation } from '@/components/panel/data';
import { fa, fromToman, idOf, num, toToman } from '@/components/panel/format';
import { btn, inputCls, textareaCls } from '@/components/panel/styles';
import { Card, Field, QueryBoundary, SectionTitle, Spinner } from '@/components/panel/ui';

const REMINDERS = [
  [-2880, '۲ روز قبل'],
  [-1440, '۱ روز قبل'],
  [-240, '۴ ساعت قبل'],
  [-120, '۲ ساعت قبل'],
  [-60, '۱ ساعت قبل'],
];

function SettingsForm({ setting }) {
  const [f, setF] = useState({
    businessName: setting.businessName || '',
    leadTimeMinutes: String(setting.leadTimeMinutes ?? 0),
    horizonDays: String(setting.horizonDays ?? 30),
    cancellationWindowHours: String(setting.cancellationWindowHours ?? 24),
    rescheduleWindowHours: String(setting.rescheduleWindowHours ?? 24),
    noShowFeeAmount: String(toToman(setting.noShowFeeAmount ?? 0)),
    maxActivePerClient: String(setting.maxActivePerClient ?? 3),
    autoConfirm: setting.autoConfirm ?? false,
    allowGuestBooking: setting.allowGuestBooking ?? true,
    requirePhone: setting.requirePhone ?? true,
    reminders: setting.reminderOffsetsMinutes || [],
    cancellationPolicyText: setting.cancellationPolicyText || '',
    workingHoursNote: setting.workingHoursNote || '',
  });
  const bind = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const ints = ['leadTimeMinutes', 'horizonDays', 'cancellationWindowHours', 'rescheduleWindowHours', 'maxActivePerClient'];
  const valid = ints.every((k) => Number.isInteger(num(f[k])) && num(f[k]) >= 0) && Number.isFinite(num(f.noShowFeeAmount)) && num(f.horizonDays) >= 1;
  const save = usePanelMutation(
    () =>
      rec('booking_setting').update(idOf(setting), {
        businessName: f.businessName.trim() || undefined,
        leadTimeMinutes: num(f.leadTimeMinutes),
        horizonDays: num(f.horizonDays),
        cancellationWindowHours: num(f.cancellationWindowHours),
        rescheduleWindowHours: num(f.rescheduleWindowHours),
        noShowFeeAmount: fromToman(num(f.noShowFeeAmount)),
        maxActivePerClient: Math.max(1, num(f.maxActivePerClient)),
        autoConfirm: f.autoConfirm,
        allowGuestBooking: f.allowGuestBooking,
        requirePhone: f.requirePhone,
        reminderOffsetsMinutes: f.reminders,
        cancellationPolicyText: f.cancellationPolicyText,
        workingHoursNote: f.workingHoursNote,
      }),
    { success: 'تنظیمات ذخیره شد' },
  );
  const toggleReminder = (m) => setF({ ...f, reminders: f.reminders.includes(m) ? f.reminders.filter((x) => x !== m) : [...f.reminders, m].sort((a, b) => a - b) });
  const switchRow = (k, label, hint) => (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <span className="min-w-0 text-sm">
        {label}
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={f[k]} onCheckedChange={(v) => setF({ ...f, [k]: v })} aria-label={label} />
    </div>
  );

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (valid && !save.isPending) save.mutate(); }}>
      <Card className="space-y-3">
        <SectionTitle title="قوانین نوبت‌گیری" hint={`منطقه زمانی: ${setting.timezone || 'Asia/Tehran'} (ثابت)`} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="نام مجموعه" className="sm:col-span-2 lg:col-span-3">{(id) => <input id={id} className={inputCls} {...bind('businessName')} />}</Field>
          <Field label="حداقل فاصله تا نوبت (دقیقه)" hint="مشتری نمی‌تواند نزدیک‌تر از این رزرو کند">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...bind('leadTimeMinutes')} />}</Field>
          <Field label="بازه نوبت‌گیری (روز)" hint="تا چند روز آینده باز است">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...bind('horizonDays')} />}</Field>
          <Field label="حداکثر نوبت فعال هر مشتری">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...bind('maxActivePerClient')} />}</Field>
          <Field label="مهلت لغو رایگان (ساعت)">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...bind('cancellationWindowHours')} />}</Field>
          <Field label="مهلت جابه‌جایی (ساعت)">{(id) => <input id={id} inputMode="numeric" className={inputCls} {...bind('rescheduleWindowHours')} />}</Field>
          <Field label="جریمه عدم حضور (تومان)" hint={num(f.noShowFeeAmount) ? `${fa(num(f.noShowFeeAmount))} تومان` : 'بدون جریمه'}>{(id) => <input id={id} inputMode="numeric" className={inputCls} {...bind('noShowFeeAmount')} />}</Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {switchRow('autoConfirm', 'تأیید خودکار نوبت‌ها', 'بدون صف تأیید پذیرش')}
          {switchRow('allowGuestBooking', 'رزرو بدون ورود', 'مهمان با نام و موبایل')}
          {switchRow('requirePhone', 'شماره موبایل اجباری')}
        </div>
      </Card>
      <Card className="space-y-3">
        <SectionTitle title="یادآوری" hint="پیامک یا تلگرام پیش از نوبت ارسال می‌شود" />
        <div className="flex flex-wrap gap-2">
          {REMINDERS.map(([m, label]) => (
            <label key={m} className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm ${f.reminders.includes(m) ? 'border-primary bg-primary/10' : 'border-border'}`}>
              <input type="checkbox" checked={f.reminders.includes(m)} onChange={() => toggleReminder(m)} />
              {label}
            </label>
          ))}
        </div>
      </Card>
      <Card className="space-y-3">
        <SectionTitle title="متن‌ها" />
        <Field label="سیاست لغو و جابه‌جایی">{(id) => <textarea id={id} className={textareaCls} maxLength={1000} {...bind('cancellationPolicyText')} />}</Field>
        <Field label="توضیح ساعت کاری (نمایش در سایت)">{(id) => <textarea id={id} className={textareaCls} maxLength={500} {...bind('workingHoursNote')} />}</Field>
      </Card>
      <div className="flex justify-end">
        <button type="submit" className={btn.primary} disabled={!valid || save.isPending}>
          {save.isPending && <Spinner />}
          ذخیره تنظیمات
        </button>
      </div>
    </form>
  );
}

export default function PanelSettings() {
  const settings = useSettings();
  const setting = settings.data?.[0];
  return (
    <PanelShell title="تنظیمات" description="قوانین نوبت‌گیری، یادآوری و متن‌ها">
      <QueryBoundary query={settings} isEmpty={!setting} rows={5}>
        {setting && <SettingsForm key={`${idOf(setting)}:${setting.updated_at}`} setting={setting} />}
      </QueryBoundary>
    </PanelShell>
  );
}
