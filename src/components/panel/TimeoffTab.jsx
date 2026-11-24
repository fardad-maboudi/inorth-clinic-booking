import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { rec, useResources, useTimeoff, usePanelMutation } from './data';
import { TIMEOFF_KINDS, idOf, isoAt, jalaliShort, jalaliMid, todayKey } from './format';
import { btn, inputCls } from './styles';
import { Card, ConfirmDialog, DataTable, DatePick, EmptyState, Field, QueryBoundary, SectionTitle, SelectField, Spinner, StatusBadge } from './ui';

export default function TimeoffTab() {
  const timeoff = useTimeoff();
  const resources = useResources();
  const [kind, setKind] = useState('holiday');
  const [resource, setResource] = useState('');
  const [from, setFrom] = useState(todayKey());
  const [to, setTo] = useState(todayKey());
  const [reason, setReason] = useState('');
  const [yearly, setYearly] = useState(false);
  const [removing, setRemoving] = useState(null);
  const names = new Map((resources.data || []).map((r) => [idOf(r), r.name]));
  const valid = from && to && to >= from && reason.trim();

  const create = usePanelMutation(
    () =>
      rec('booking_timeoff').create({
        startsAt: new Date(isoAt(from, '00:00')).toISOString(),
        endsAt: new Date(`${to}T23:59:59+03:30`).toISOString(),
        allDay: true,
        kind,
        reason: reason.trim(),
        recurrence: 'none',
        repeatsAnnually: yearly,
        ...(resource ? { resource } : {}),
      }),
    { success: 'تعطیلی ثبت شد؛ زمان‌های آزاد آن بازه دیگر ساخته نمی‌شود', onSuccess: () => setReason('') },
  );
  const remove = usePanelMutation((id) => rec('booking_timeoff').remove(id), { success: 'تعطیلی حذف شد', onSuccess: () => setRemoving(null) });
  const rows = timeoff.data || [];

  const columns = [
    { key: 'reason', header: 'عنوان', primary: true, cell: (t) => <span className="font-medium">{t.reason || TIMEOFF_KINDS[t.kind]}</span> },
    { key: 'kind', header: 'نوع', cell: (t) => <StatusBadge label={TIMEOFF_KINDS[t.kind] || t.kind} tone="neutral" /> },
    { key: 'who', header: 'برای', cell: (t) => (t.resource ? names.get(String(t.resource)) || 'همکار' : 'کل مجموعه') },
    { key: 'when', header: 'تاریخ', cell: (t) => (jalaliShort(t.startsAt) === jalaliShort(t.endsAt) ? jalaliMid(t.startsAt) : `${jalaliMid(t.startsAt)} تا ${jalaliMid(t.endsAt)}`) },
    { key: 'rep', header: 'تکرار', hideOnMobile: true, cell: (t) => (t.repeatsAnnually ? 'هر سال' : '—') },
    {
      key: 'del',
      header: '',
      cell: (t) => (
        <button type="button" className="grid size-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10" aria-label="حذف" onClick={(e) => { e.stopPropagation(); setRemoving(t); }}>
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      ),
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
      <Card>
        <SectionTitle title="ثبت تعطیلی یا مرخصی" />
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); if (valid && !create.isPending) create.mutate(); }}>
          <SelectField label="نوع" value={kind} onChange={setKind} options={Object.entries(TIMEOFF_KINDS).map(([value, label]) => ({ value, label }))} />
          <SelectField label="برای" value={resource} onChange={setResource} placeholder="کل مجموعه" options={(resources.data || []).map((r) => ({ value: idOf(r), label: r.name }))} />
          <div className="grid grid-cols-2 gap-3">
            <DatePick label="از تاریخ" value={from} emptyLabel="انتخاب" onChange={(v) => { setFrom(v); if (v > to) setTo(v); }} />
            <DatePick label="تا تاریخ" value={to} min={from} emptyLabel="انتخاب" onChange={setTo} />
          </div>
          <Field label="عنوان">{(id) => <input id={id} className={inputCls} maxLength={240} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثلاً: تعطیلی رسمی" />}</Field>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <span className="text-sm">هر سال تکرار شود</span>
            <Switch checked={yearly} onCheckedChange={setYearly} aria-label="تکرار سالانه" />
          </div>
          <button type="submit" className={btn.primary} disabled={!valid || create.isPending}>
            {create.isPending && <Spinner />}
            ثبت تعطیلی
          </button>
        </form>
      </Card>
      <div className="min-w-0 space-y-3">
        <QueryBoundary query={timeoff} isEmpty={!rows.length} empty={<EmptyState title="تعطیلی ثبت نشده" hint="تعطیلات رسمی و مرخصی همکاران را اینجا ثبت کنید تا نوبت‌گیری در آن روزها بسته شود." />}>
          <DataTable caption="تعطیلی‌ها" columns={columns} rows={rows} rowKey={(t) => idOf(t)} />
        </QueryBoundary>
      </div>
      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="حذف تعطیلی"
        description="با حذف، نوبت‌گیری در این بازه دوباره ممکن می‌شود (پس از ساخت مجدد زمان‌های آزاد)."
        confirmLabel="حذف"
        pending={remove.isPending}
        onConfirm={() => remove.mutate(idOf(removing))}
      />
    </div>
  );
}
