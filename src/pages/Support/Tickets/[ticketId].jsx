import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSupportTicket, replyToSupportTicket, subscribeToSupportTicket } from '@/api/plugins/support-desk';

export default function SupportTicketPage() {
  const { ticketId } = useParams();
  const [thread, setThread] = useState(null);
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!ticketId) return;
    try {
      const response = await getSupportTicket(ticketId);
      setThread(response?.data || null);
    } catch (err) {
      setError(err?.message || 'بارگذاری گفتگو ناموفق بود');
    }
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return undefined;
    let cancelled = false;

    getSupportTicket(ticketId)
      .then((response) => {
        if (!cancelled) setThread(response?.data || null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'بارگذاری گفتگو ناموفق بود');
      });

    return subscribeToSupportTicket(ticketId, () => {
      void load();
    });
  }, [ticketId, load]);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await replyToSupportTicket(ticketId, body);
      setBody('');
      await load();
    } catch (err) {
      setError(err?.message || 'ارسال پاسخ ناموفق بود');
    } finally {
      setPending(false);
    }
  }

  if (!thread) return <main dir="rtl" className="mx-auto max-w-3xl bg-surface p-8 text-foreground">{error || 'در حال بارگذاری…'}</main>;
  const { ticket, replies } = thread;
  return <main dir="rtl" className="mx-auto max-w-3xl space-y-6 bg-surface px-4 py-10 text-foreground">
    <Link to="/support/tickets" className="text-sm text-muted-foreground">بازگشت به تیکت‌ها</Link>
    <header className="rounded-2xl border border-border bg-surface p-5"><h1 className="text-xl font-bold">{ticket.subject}</h1><p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{ticket.body}</p></header>
    <section className="space-y-3">{replies.map((reply) => <article key={reply._id} className={`rounded-xl p-4 ${reply.authorType === 'support' ? 'bg-primary text-on-primary' : 'border border-border bg-surface'}`}><p className="whitespace-pre-wrap text-sm">{reply.body}</p></article>)}</section>
    {ticket.status !== 'closed' && <form onSubmit={submit} className="space-y-3"><textarea aria-label="پاسخ" value={body} onChange={(e) => setBody(e.target.value)} required maxLength={10000} rows={4} className="w-full rounded-xl border border-border bg-surface px-3 py-2" placeholder="پاسخ شما" /><button disabled={pending} className="rounded-xl bg-primary px-5 py-2 text-on-primary disabled:opacity-50">{pending ? 'در حال ارسال…' : 'ارسال پاسخ'}</button></form>}
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
  </main>;
}
