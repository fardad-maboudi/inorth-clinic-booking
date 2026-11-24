import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { updateService } from '@/api/backoffice/bookings';
import PanelShell from '@/components/panel/PanelShell';
import ServiceDialog from '@/components/panel/ServiceDialog';
import StaffTab from '@/components/panel/StaffTab';
import TimeoffTab from '@/components/panel/TimeoffTab';
import { useResources, useServices, usePanelMutation } from '@/components/panel/data';
import { fa, idOf, toToman } from '@/components/panel/format';
import { btn } from '@/components/panel/styles';
import { ConfirmDialog, DataTable, EmptyState, QueryBoundary, StatusBadge } from '@/components/panel/ui';
import { cn } from '@/lib/utils';

const TABS = [
  ['services', 'خدمات'],
  ['staff', 'همکاران و ساعت کاری'],
  ['timeoff', 'تعطیلی‌ها'],
];

function ServicesTab() {
  const services = useServices();
  const resources = useResources();
  const [dialog, setDialog] = useState(null);
  const [toggling, setToggling] = useState(null);
  const names = new Map((resources.data || []).map((r) => [idOf(r), r.name]));
  const toggle = usePanelMutation((s) => updateService(idOf(s), { active: s.active === false }), {
    success: (_r, s) => (s.active === false ? 'خدمت فعال شد' : 'خدمت غیرفعال شد'),
    onSuccess: () => setToggling(null),
  });
  const rows = services.data || [];
  const columns = [
    {
      key: 'name',
      header: 'خدمت',
      primary: true,
      cell: (s) => (
        <div className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate font-medium">{s.name}</span>
            {s.group && <span className="block text-xs text-muted-foreground">{s.group}</span>}
          </span>
        </div>
      ),
    },
    { key: 'dur', header: 'مدت', cell: (s) => `${fa(s.durationMinutes)} دقیقه` },
    { key: 'price', header: 'قیمت', cell: (s) => `${fa(toToman(s.price, s.currency))} تومان` },
    { key: 'staff', header: 'همکاران', hideOnMobile: true, cell: (s) => (s.resourceIds || []).map((id) => names.get(String(id))).filter(Boolean).join('، ') || '—' },
    {
      key: 'pkg',
      header: 'بسته',
      cell: (s) =>
        s.package?.enabled ? (
          <span className="text-xs">
            {fa(s.package.sessionCount)} جلسه · {fa(toToman(s.package.price, s.currency))} تومان
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    { key: 'state', header: 'وضعیت', cell: (s) => (s.active === false ? <StatusBadge label="غیرفعال" tone="neutral" /> : <StatusBadge label="فعال" tone="good" />) },
    {
      key: 'act',
      header: 'عملیات',
      cell: (s) => (
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button type="button" className={cn(btn.outline, btn.sm)} onClick={() => setDialog({ service: s })}>
            <Pencil className="size-3.5" aria-hidden="true" />
            ویرایش
          </button>
          <button type="button" className={cn(s.active === false ? btn.outline : btn.dangerOutline, btn.sm)} onClick={() => (s.active === false ? toggle.mutate(s) : setToggling(s))}>
            {s.active === false ? 'فعال‌سازی' : 'غیرفعال'}
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button type="button" className={btn.primary} onClick={() => setDialog({})}>
          خدمت جدید
        </button>
      </div>
      <QueryBoundary query={services} isEmpty={!rows.length} empty={<EmptyState title="خدمتی تعریف نشده" hint="اولین خدمت را اضافه کنید تا مشتریان بتوانند نوبت بگیرند." />}>
        <DataTable caption="خدمات" columns={columns} rows={rows} rowKey={(s) => idOf(s)} onRowClick={(s) => setDialog({ service: s })} />
      </QueryBoundary>
      {dialog && <ServiceDialog service={dialog.service} resources={resources.data || []} onClose={() => setDialog(null)} />}
      <ConfirmDialog
        open={Boolean(toggling)}
        onOpenChange={(open) => !open && setToggling(null)}
        title="غیرفعال کردن خدمت"
        description={toggling ? `«${toggling.name}» از سایت و تلگرام پنهان می‌شود. نوبت‌های ثبت‌شده باقی می‌مانند.` : ''}
        confirmLabel="غیرفعال کن"
        pending={toggle.isPending}
        onConfirm={() => toggle.mutate(toggling)}
      />
    </div>
  );
}

export default function PanelServices() {
  const [tab, setTab] = useState('services');
  const resources = useResources();
  return (
    <PanelShell title="خدمات و برنامه کاری" description="خدمت‌ها، همکاران، ساعت هفتگی و تعطیلی‌ها">
      <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={cn('h-9 shrink-0 rounded-full border px-4 text-sm font-medium', tab === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-subtle')}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'services' && <ServicesTab />}
      {tab === 'staff' && <StaffTab resourcesQuery={resources} />}
      {tab === 'timeoff' && <TimeoffTab />}
    </PanelShell>
  );
}
