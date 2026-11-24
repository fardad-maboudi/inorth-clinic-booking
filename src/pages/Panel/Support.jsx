import { useState } from 'react';
import { pluginAction } from '@/api/backoffice/client';
import PanelShell from '@/components/panel/PanelShell';
import { usePanelMutation, usePanelQuery } from '@/components/panel/data';
import { dateTimeLabel, fa, idOf } from '@/components/panel/format';
import { useIsDesktop } from '@/components/panel/hooks';
import { btn, textareaCls } from '@/components/panel/styles';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, QueryBoundary, Spinner, StatusBadge } from '@/components/panel/ui';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const STATUS = {
  open: ['باز', 'warn'],
  waiting_on_support: ['منتظر پاسخ ما', 'warn'],
  waiting_on_customer: ['منتظر مشتری', 'confirmed'],
  answered: ['پاسخ داده‌شده', 'confirmed'],
  resolved: ['حل‌شده', 'good'],
  closed: ['بسته', 'neutral'],
};
const FILTERS = [
  ['', 'همه'],
  ['open', 'باز'],
  ['waiting_on_support', 'منتظر پاسخ ما'],
  ['waiting_on_customer', 'منتظر مشتری'],
  ['answered', 'پاسخ داده‌شده'],
  ['closed', 'بسته'],
];
const unwrap = (r) => (r?.data && !Array.isArray(r.data) ? r.data : r);
const asList = (r) => Array.from(Array.isArray(r) ? r : unwrap(r)?.data || unwrap(r)?.items || (Array.isArray(r?.data) ? r.data : []));

function Thread({ ticket, onClose }) {
  const desktop = useIsDesktop();
  const id = idOf(ticket);
  const [text, setText] = useState('');
  const [closing, setClosing] = useState(false);
  const detail = usePanelQuery(['support-ticket', id], async () => {
    const r = unwrap(await pluginAction('support-desk', `tickets/${id}`, { query: { limit: 200 } }));
    return { ticket: r?.ticket || r, replies: Array.from(r?.replies || r?.messages || []) };
  });
  const reply = usePanelMutation(() => pluginAction('support-desk', `tickets/${id}/replies`, { method: 'POST', body: { body: text.trim() } }), {
    success: 'پاسخ ارسال شد',
    onSuccess: () => setText(''),
  });
  const close = usePanelMutation(() => pluginAction('support-desk', `tickets/${id}/close`, { method: 'POST', body: {} }), { success: 'درخواست بسته شد', onSuccess: () => { setClosing(false); onClose(); } });
  const t = detail.data?.ticket || ticket;
  const closed = t.status === 'closed';
  return (
    <>
      <Sheet open onOpenChange={(next) => !next && onClose()} direction={desktop ? 'left' : 'bottom'}>
        <SheetContent dir="rtl" className="overflow-y-auto sm:max-w-md md:w-[28rem]">
          <SheetHeader>
            <SheetTitle className="leading-7">{t.subject}</SheetTitle>
            <SheetDescription className="sr-only">گفتگوی درخواست پشتیبانی</SheetDescription>
            <StatusBadge className="self-start" label={(STATUS[t.status] || [t.status])[0]} tone={(STATUS[t.status] || [])[1] || 'neutral'} />
          </SheetHeader>
          {detail.isLoading ? (
            <LoadingState rows={3} />
          ) : detail.isError ? (
            <ErrorState error={detail.error} onRetry={() => void detail.refetch()} />
          ) : (
            <div className="space-y-2">
              {t.body && (
                <div className="rounded-lg border border-border bg-background p-3 text-sm leading-7">
                  <p className="mb-1 text-xs text-muted-foreground">مشتری · {dateTimeLabel(t.created_at)}</p>
                  {t.body}
                </div>
              )}
              {detail.data.replies.map((r) => (
                <div key={idOf(r)} className={cn('rounded-lg p-3 text-sm leading-7', (r.authorType || r.author) === 'customer' ? 'border border-border bg-background' : 'bg-primary/10')}>
                  <p className="mb-1 text-xs text-muted-foreground">
                    {(r.authorType || r.author) === 'customer' ? 'مشتری' : 'پشتیبانی'} · {dateTimeLabel(r.created_at)}
                  </p>
                  {r.body}
                </div>
              ))}
            </div>
          )}
          {!closed && (
            <div className="mt-auto space-y-2">
              <textarea className={textareaCls} aria-label="پاسخ" placeholder="پاسخ به مشتری…" value={text} maxLength={10000} onChange={(e) => setText(e.target.value)} />
              <div className="flex gap-2">
                <button type="button" className={cn(btn.primary, 'flex-1')} disabled={!text.trim() || reply.isPending} onClick={() => reply.mutate()}>
                  {reply.isPending && <Spinner />}
                  ارسال پاسخ
                </button>
                <button type="button" className={btn.dangerOutline} onClick={() => setClosing(true)}>
                  بستن
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <ConfirmDialog open={closing} onOpenChange={setClosing} title="بستن درخواست" description="پس از بستن امکان پاسخ‌دهی نیست، اما تاریخچه حفظ می‌شود." confirmLabel="بستن درخواست" pending={close.isPending} onConfirm={() => close.mutate()} />
    </>
  );
}

export default function PanelSupport() {
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const tickets = usePanelQuery(['support-tickets', status], async () => asList(await pluginAction('support-desk', 'tickets', { query: { status: status || undefined, limit: 50 } })));
  const rows = tickets.data || [];
  return (
    <PanelShell title="پشتیبانی" description="درخواست‌های مشتریان؛ پاسخ و بستن">
      <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
        {FILTERS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={status === key} onClick={() => setStatus(key)} className={cn('h-9 shrink-0 rounded-full border px-4 text-sm font-medium', status === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-subtle')}>
            {label}
          </button>
        ))}
      </div>
      <QueryBoundary query={tickets} isEmpty={!rows.length} empty={<EmptyState title="درخواستی وجود ندارد" hint="درخواست‌هایی که مشتریان از حساب کاربری ثبت می‌کنند اینجا دیده می‌شود." />}>
        <ul className="space-y-2">
          {rows.map((t) => {
            const [label, tone] = STATUS[t.status] || [t.status, 'neutral'];
            return (
              <li key={idOf(t)}>
                <button type="button" onClick={() => setSelected(t)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-start hover:bg-subtle">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.subject}</span>
                    <span className="block truncate text-xs text-muted-foreground">{dateTimeLabel(t.lastMessageAt || t.created_at)}</span>
                  </span>
                  <StatusBadge label={label} tone={tone} />
                </button>
              </li>
            );
          })}
        </ul>
        <p className="text-center text-xs text-muted-foreground">{fa(rows.length)} درخواست</p>
      </QueryBoundary>
      {selected && <Thread key={idOf(selected)} ticket={selected} onClose={() => setSelected(null)} />}
    </PanelShell>
  );
}
