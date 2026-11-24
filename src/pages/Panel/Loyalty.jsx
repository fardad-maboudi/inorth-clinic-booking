import { useState } from 'react';
import { adjustPoints } from '@/api/backoffice/loyalty-club';
import { pluginRecords } from '@/api/backoffice/client';
import PanelShell from '@/components/panel/PanelShell';
import { useClients, usePanelMutation, usePanelQuery } from '@/components/panel/data';
import { dateTimeLabel, fa, idOf, num } from '@/components/panel/format';
import { btn, inputCls } from '@/components/panel/styles';
import { Card, ConfirmDialog, DataTable, EmptyState, Field, QueryBoundary, SectionTitle, StatCard, StatusBadge } from '@/components/panel/ui';
import { cn } from '@/lib/utils';

const TIERS = { bronze: 'برنزی', silver: 'نقره‌ای', gold: 'طلایی', platinum: 'پلاتینی' };

export default function PanelLoyalty() {
  const members = usePanelQuery(['loyalty-members'], async () => Array.from(await pluginRecords('loyalty-club', 'loyalty_member').list({ limit: 200, sort: '-points' })));
  const ledger = usePanelQuery(['loyalty-ledger'], async () => Array.from(await pluginRecords('loyalty-club', 'loyalty_ledger').list({ limit: 15, sort: '-created_at' })));
  const clients = useClients(500);
  const [target, setTarget] = useState(null);
  const [delta, setDelta] = useState('');
  const [note, setNote] = useState('');
  const byUser = new Map((clients.data || []).map((c) => [String(c.clientUserId), c]));
  const rows = members.data || [];
  const nameOf = (m) => byUser.get(String(m.user))?.fullName || 'عضو بدون پرونده مشتری';
  const amount = num(delta);
  const valid = Number.isInteger(amount) && amount !== 0 && note.trim();
  const adjust = usePanelMutation(() => adjustPoints(String(target.user), amount, note.trim()), {
    success: 'امتیاز مشتری اصلاح شد',
    onSuccess: () => { setTarget(null); setDelta(''); setNote(''); },
  });

  const columns = [
    { key: 'name', header: 'عضو', primary: true, cell: (m) => <span className="font-medium">{nameOf(m)}</span> },
    { key: 'tier', header: 'سطح', cell: (m) => <StatusBadge label={TIERS[m.tier] || m.tier} tone="neutral" /> },
    { key: 'points', header: 'امتیاز', cell: (m) => <span className="font-bold">{fa(m.points || 0)}</span> },
    { key: 'spend', header: 'مجموع خرید', hideOnMobile: true, cell: (m) => fa(Math.round((m.lifetimeSpend || 0) / 10)) },
    { key: 'gift', header: 'اعتبار هدیه', hideOnMobile: true, cell: (m) => fa(Math.round((m.giftCardBalance || 0) / 10)) },
    {
      key: 'act',
      header: '',
      cell: (m) => (
        <button type="button" className={cn(btn.outline, btn.sm)} onClick={(e) => { e.stopPropagation(); setTarget(m); }}>
          اصلاح امتیاز
        </button>
      ),
    },
  ];

  return (
    <PanelShell title="باشگاه مشتریان" description="امتیاز و سطح اعضا؛ اصلاح دستی با ثبت دلیل">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="اعضا" value={fa(rows.length)} />
        <StatCard label="مجموع امتیاز" value={fa(rows.reduce((s, m) => s + (m.points || 0), 0))} />
        <StatCard label="اعضای طلایی و بالاتر" value={fa(rows.filter((m) => m.tier === 'gold' || m.tier === 'platinum').length)} />
      </div>
      <Card>
        <SectionTitle title="اعضا" hint="امتیاز با خرید و فعالیت‌های سایت جمع می‌شود؛ رزروهای تکمیل‌شده امتیاز اضافه نمی‌کنند مگر اصلاح دستی شود" />
        <QueryBoundary query={members} isEmpty={!rows.length} empty={<EmptyState title="هنوز عضوی ثبت نشده" hint="اعضا با اولین ورود مشتری به سایت ساخته می‌شوند." />}>
          <DataTable caption="اعضای باشگاه" columns={columns} rows={rows} rowKey={(m) => idOf(m)} />
        </QueryBoundary>
      </Card>
      <Card>
        <SectionTitle title="آخرین تراکنش‌های امتیاز" />
        <QueryBoundary query={ledger} isEmpty={!(ledger.data || []).length} empty={<p className="py-4 text-center text-sm text-muted-foreground">تراکنشی ثبت نشده است.</p>} rows={2}>
          <ul className="divide-y divide-border text-sm">
            {(ledger.data || []).map((l) => (
              <li key={idOf(l)} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 truncate">{l.note || l.reason || l.type || 'تراکنش'}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span dir="ltr" className={cn('font-bold', (l.delta ?? l.points) < 0 ? 'text-rose-700' : 'text-emerald-700')}>{fa(l.delta ?? l.points ?? 0)}</span>
                  <span className="text-xs text-muted-foreground">{dateTimeLabel(l.created_at)}</span>
                </span>
              </li>
            ))}
          </ul>
        </QueryBoundary>
      </Card>
      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title={target ? `اصلاح امتیاز ${nameOf(target)}` : ''}
        description={target ? `امتیاز فعلی: ${fa(target.points || 0)}. عدد مثبت اضافه و عدد منفی کم می‌کند.` : ''}
        confirmLabel="ثبت اصلاح"
        tone="primary"
        confirmDisabled={!valid}
        pending={adjust.isPending}
        onConfirm={() => adjust.mutate()}
      >
        <Field label="تعداد امتیاز (مثلاً ۵۰ یا ‎-۲۰)">{(id) => <input id={id} dir="ltr" inputMode="numeric" className={inputCls} value={delta} onChange={(e) => setDelta(e.target.value)} />}</Field>
        <Field label="دلیل">{(id) => <input id={id} className={inputCls} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
      </ConfirmDialog>
    </PanelShell>
  );
}
