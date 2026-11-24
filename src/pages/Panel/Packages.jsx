import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { consumeCredit, listClientCredits } from '@/api/backoffice/bookings';
import GrantCreditDialog from '@/components/panel/GrantCreditDialog';
import PackageOrders from '@/components/panel/PackageOrders';
import PanelShell from '@/components/panel/PanelShell';
import { useClients, useLookups, usePanelMutation } from '@/components/panel/data';
import { fa, idOf, jalaliShort, toToman } from '@/components/panel/format';
import { btn } from '@/components/panel/styles';
import { Card, ConfirmDialog, DataTable, EmptyState, ErrorState, LoadingState, SectionTitle, SelectField, StatusBadge } from '@/components/panel/ui';
import { cn } from '@/lib/utils';

const CREDIT_STATUS = { active: ['فعال', 'good'], exhausted: ['تمام‌شده', 'neutral'], expired: ['منقضی', 'warn'], cancelled: ['لغوشده', 'neutral'] };
const MAX_CLIENTS = 60;

export default function PanelPackages() {
  const lookups = useLookups();
  const clients = useClients(MAX_CLIENTS);
  const [grantFor, setGrantFor] = useState('');
  const [grantOpen, setGrantOpen] = useState(false);
  const [consuming, setConsuming] = useState(null);
  const [onlyActive, setOnlyActive] = useState(true);
  const clientRows = clients.data || [];
  const results = useQueries({
    queries: clientRows.map((c) => ({
      queryKey: ['panel', 'credits', idOf(c)],
      queryFn: async () => {
        const r = await listClientCredits(idOf(c), { limit: 100, sort: '-created_at' });
        const body = r?.data && !Array.isArray(r.data) ? r.data : r;
        return Array.from(body?.items || (Array.isArray(body) ? body : []));
      },
      retry: false,
      staleTime: 10_000,
    })),
  });
  const loading = clients.isLoading || results.some((r) => r.isLoading);
  const failed = results.find((r) => r.isError);
  const resultsKey = results.map((r) => r.dataUpdatedAt).join();
  const credits = useMemo(
    () => clientRows.flatMap((c, i) => (results[i]?.data || []).map((credit) => ({ ...credit, _client: c }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `results` is a fresh array each render; its data identity is tracked via resultsKey
    [clientRows, resultsKey],
  );
  const visible = credits.filter((c) => !onlyActive || c.status === 'active');
  const withPackage = lookups.serviceList.filter((s) => s.package?.enabled);
  const consume = usePanelMutation((credit) => consumeCredit(idOf(credit), { sessions: 1, notes: 'کسر دستی توسط پذیرش' }), {
    success: 'یک جلسه از اعتبار کسر شد',
    onSuccess: () => setConsuming(null),
  });
  const grantClient = clientRows.find((c) => idOf(c) === grantFor);

  const serviceCols = [
    { key: 'name', header: 'بسته', primary: true, cell: (s) => <span className="font-medium">{s.package.name || `بسته ${s.name}`}</span> },
    { key: 'svc', header: 'خدمت', cell: (s) => s.name },
    { key: 'n', header: 'جلسات', cell: (s) => (s.package.unlimited ? 'نامحدود' : fa(s.package.sessionCount)) },
    { key: 'price', header: 'قیمت بسته', cell: (s) => `${fa(toToman(s.package.price, s.currency))} تومان` },
    { key: 'single', header: 'جلسه‌ای', hideOnMobile: true, cell: (s) => (s.package.sessionCount ? `${fa(Math.round(toToman(s.package.price, s.currency) / s.package.sessionCount))} تومان` : '—') },
    { key: 'days', header: 'اعتبار', cell: (s) => (s.package.validityDays ? `${fa(s.package.validityDays)} روز` : 'بدون انقضا') },
  ];
  const creditCols = [
    { key: 'client', header: 'مشتری', primary: true, cell: (c) => <span className="font-medium">{c._client.fullName}</span> },
    { key: 'svc', header: 'خدمت', cell: (c) => lookups.services.get(String(c.serviceId || c.serviceIds?.[0]))?.name || 'عمومی' },
    { key: 'left', header: 'باقی‌مانده', cell: (c) => (c.unlimited ? 'نامحدود' : `${fa(c.remainingSessions)} از ${fa(c.totalSessions)}`) },
    { key: 'exp', header: 'انقضا', cell: (c) => (c.expiresAt ? jalaliShort(c.expiresAt) : '—') },
    { key: 'st', header: 'وضعیت', cell: (c) => <StatusBadge label={(CREDIT_STATUS[c.status] || [c.status])[0]} tone={(CREDIT_STATUS[c.status] || [])[1] || 'neutral'} /> },
    {
      key: 'act',
      header: '',
      cell: (c) =>
        c.status === 'active' && !c.unlimited ? (
          <button type="button" className={cn(btn.outline, btn.sm)} onClick={() => setConsuming(c)}>
            کسر یک جلسه
          </button>
        ) : null,
    },
  ];

  return (
    <PanelShell title="بسته‌ها و اعتبار" description="بسته‌های چندجلسه‌ای و اعتبار جلسات مشتریان">
      <p className="rounded-lg border border-border bg-surface p-3 text-sm leading-7 text-muted-foreground">
        بسته‌ها در فروشگاه سایت فروخته می‌شوند. پس از تأیید پرداخت سفارش، جلسات را با «افزودن اعتبار» به حساب مشتری اضافه کنید؛ از همان‌جا هنگام رزرو کسر می‌شود.
      </p>

      <Card>
        <SectionTitle title="بسته‌های تعریف‌شده" hint="از «خدمات و برنامه کاری» ویرایش می‌شوند" />
        {lookups.isLoading ? (
          <LoadingState rows={2} />
        ) : withPackage.length ? (
          <DataTable caption="بسته‌ها" columns={serviceCols} rows={withPackage} rowKey={(s) => idOf(s)} />
        ) : (
          <EmptyState title="هنوز بسته‌ای تعریف نشده" hint="در ویرایش هر خدمت، گزینه «بسته چندجلسه‌ای» را فعال کنید." />
        )}
      </Card>

      <PackageOrders clients={clientRows} services={lookups.serviceList} credits={credits} />

      <Card>
        <SectionTitle
          title="اعتبارهای صادرشده"
          hint={`بر اساس ${fa(clientRows.length)} مشتری اخیر`}
          actions={
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
              فقط فعال
            </label>
          }
        />
        <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg bg-subtle p-3">
          <SelectField className="min-w-52 flex-1" label="افزودن اعتبار برای" value={grantFor} onChange={setGrantFor} placeholder="انتخاب مشتری…" options={clientRows.map((c) => ({ value: idOf(c), label: c.fullName }))} />
          <button type="button" className={btn.primary} disabled={!grantClient} onClick={() => setGrantOpen(true)}>
            افزودن اعتبار
          </button>
        </div>
        {clients.isError ? (
          <ErrorState error={clients.error} onRetry={() => void clients.refetch()} />
        ) : loading ? (
          <LoadingState rows={3} />
        ) : (
          <>
            {failed && <p className="mb-2 text-xs text-destructive">دریافت اعتبار بعضی مشتریان انجام نشد: {failed.error?.message}</p>}
            {visible.length ? <DataTable caption="اعتبارها" columns={creditCols} rows={visible} rowKey={(c) => idOf(c)} /> : <EmptyState title="اعتباری ثبت نشده" hint="پس از تأیید پرداخت یک بسته، اعتبار آن را برای مشتری ثبت کنید." />}
          </>
        )}
      </Card>

      {grantOpen && grantClient && <GrantCreditDialog client={grantClient} services={lookups.serviceList} onClose={() => setGrantOpen(false)} />}
      <ConfirmDialog
        open={Boolean(consuming)}
        onOpenChange={(open) => !open && setConsuming(null)}
        title="کسر دستی یک جلسه"
        description={consuming ? `یک جلسه از اعتبار «${consuming._client.fullName}» کم می‌شود. این کار برای جلسه‌ای است که بدون رزرو انجام شده.` : ''}
        confirmLabel="کسر جلسه"
        pending={consume.isPending}
        onConfirm={() => consume.mutate(consuming)}
      />
    </PanelShell>
  );
}
