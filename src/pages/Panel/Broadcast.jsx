import { useState } from 'react';
import { pluginAction } from '@/api/backoffice/client';
import PanelShell from '@/components/panel/PanelShell';
import { usePanelMutation, usePanelQuery } from '@/components/panel/data';
import { fa } from '@/components/panel/format';
import { btn, textareaCls } from '@/components/panel/styles';
import { Card, ConfirmDialog, Field, LoadingState, SectionTitle, StatCard, StatusBadge } from '@/components/panel/ui';

const MAX = 4096;
const unwrap = (r) => (r?.data && typeof r.data === 'object' && !Array.isArray(r.data) ? r.data : r);
const sentCount = (r) => {
  const body = unwrap(r) || {};
  return body.sent ?? body.queued ?? body.broadcast?.delivered ?? 0;
};

export default function PanelBroadcast() {
  const status = usePanelQuery(['telegram-status'], async () => unwrap(await pluginAction('telegram', 'status')));
  const [text, setText] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState([]);
  const send = usePanelMutation(() => pluginAction('telegram', 'broadcast', { method: 'POST', body: { text: text.trim() } }), {
    success: (result) => `پیام برای ${fa(sentCount(result))} مشترک ارسال شد`,
    onSuccess: (result) => {
      setSent((prev) => [{ text: text.trim(), count: sentCount(result), at: new Date() }, ...prev]);
      setText('');
      setConfirming(false);
    },
  });
  const s = status.data;
  const denied = status.isError && (status.error?.status === 403 || status.error?.status === 401);
  const connected = Boolean(s?.connected);
  const subscribers = s?.users ?? s?.subscribers ?? 0;

  return (
    <PanelShell title="پیام تلگرام" description="ارسال پیام همگانی به مشترکان ربات">
      {status.isLoading ? (
        <LoadingState rows={2} />
      ) : denied ? (
        <Card className="space-y-2 text-sm leading-7">
          <div role="heading" aria-level={2} className="font-bold">دسترسی مالک لازم است</div>
          <p className="text-muted-foreground">سرور ارسال پیام همگانی تلگرام را فقط برای مالک سایت مجاز می‌داند. با حساب مالک وارد شوید یا از مالک بخواهید پیام را ارسال کند.</p>
        </Card>
      ) : status.isError ? (
        <Card className="space-y-3 text-sm">
          <p className="text-destructive">{status.error?.message || 'وضعیت ربات دریافت نشد'}</p>
          <button type="button" className={btn.outline} onClick={() => void status.refetch()}>
            تلاش دوباره
          </button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="وضعیت ربات" value={connected ? 'متصل' : 'قطع'} tone={connected ? 'good' : 'warn'} />
            <StatCard label="مشترکان" value={fa(subscribers)} hint="کاربرانی که ربات را شروع کرده‌اند" />
            <StatCard label="ربات" value={s?.botUsername ? `@${s.botUsername}` : '-'} />
          </div>
          {!connected && (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-7 text-amber-900">ربات تلگرام هنوز متصل نیست. از استودیو (بخش تلگرام) ربات را وصل کنید؛ تا آن زمان ارسال همگانی ممکن نیست.</p>
          )}
          <Card className="space-y-3">
            <SectionTitle title="پیام جدید" hint="پیام فوراً برای همه مشترکان ارسال می‌شود و قابل بازگشت نیست" />
            <Field label="متن پیام" hint={`${fa(text.length)} از ${fa(MAX)} نویسه`}>
              {(id) => <textarea id={id} className={`${textareaCls} min-h-36`} maxLength={MAX} value={text} onChange={(e) => setText(e.target.value)} placeholder="مثلاً: این هفته ۲۰٪ تخفیف لیزر…" />}
            </Field>
            <button type="button" className={btn.primary} disabled={!text.trim() || !connected || send.isPending} onClick={() => setConfirming(true)}>
              ارسال به مشترکان
            </button>
          </Card>
          {sent.length > 0 && (
            <Card>
              <SectionTitle title="ارسال‌های این نشست" />
              <ul className="divide-y divide-border text-sm">
                {sent.map((m, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 truncate">{m.text}</span>
                    <StatusBadge label={`${fa(m.count)} دریافت‌کننده`} tone="good" />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="ارسال پیام همگانی"
        description={`این پیام برای ${fa(subscribers)} مشترک ارسال می‌شود. ادامه می‌دهید؟`}
        confirmLabel="ارسال"
        tone="primary"
        pending={send.isPending}
        onConfirm={() => send.mutate()}
      >
        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-subtle p-3 text-sm">{text}</p>
      </ConfirmDialog>
    </PanelShell>
  );
}
