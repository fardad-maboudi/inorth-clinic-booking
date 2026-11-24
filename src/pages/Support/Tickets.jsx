import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createSupportTicket, listSupportTickets } from '@/api/plugins/support-desk';

const STATUS = {
  open: 'باز',
  waiting_on_support: 'در انتظار پشتیبانی',
  waiting_on_customer: 'در انتظار پاسخ شما',
  resolved: 'حل‌شده',
  closed: 'بسته',
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await listSupportTickets();
      setTickets(response?.data || []);
    } catch (err) {
      setError(err?.message || 'بارگذاری تیکت‌ها ناموفق بود');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listSupportTickets()
      .then((response) => {
        if (!cancelled) {
          setTickets(response?.data || []);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'بارگذاری تیکت‌ها ناموفق بود');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await createSupportTicket({ subject, body, source: 'web' });
      setSubject('');
      setBody('');
      await load();
    } catch (err) {
      setError(err?.message || 'ثبت تیکت ناموفق بود');
    } finally {
      setPending(false);
    }
  }

  return <main dir="rtl" className="mx-auto max-w-3xl space-y-8 bg-surface px-4 py-10 text-foreground">
    <header>
      <h1 className="text-2xl font-bold">پشتیبانی</h1>
      <p className="mt-2 text-sm text-muted-foreground">درخواست خود را ثبت کنید و پاسخ‌ها را همین‌جا دنبال کنید.</p>
    </header>
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <input aria-label="موضوع" value={subject} onChange={(e) => setSubject(e.target.value)} minLength={3} maxLength={200} required placeholder="موضوع درخواست" className="w-full rounded-xl border border-border bg-surface px-3 py-2" />
      <textarea aria-label="شرح درخواست" value={body} onChange={(e) => setBody(e.target.value)} maxLength={10000} required rows={5} placeholder="چه کمکی از دست ما برمی‌آید؟" className="w-full rounded-xl border border-border bg-surface px-3 py-2" />
      <button disabled={pending} className="rounded-xl bg-primary px-5 py-2 text-on-primary disabled:opacity-50">{pending ? 'در حال ثبت…' : 'ثبت تیکت'}</button>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </form>
    <section className="space-y-3">
      <h2 className="font-semibold">تیکت‌های من</h2>
      {tickets.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">هنوز تیکتی ثبت نشده است.</p>}
      {tickets.map((ticket) => <Link key={ticket._id} to={`/support/tickets/${ticket._id}`} className="block rounded-xl border border-border bg-surface p-4 hover:border-primary-ink">
        <div className="flex items-center justify-between gap-3"><strong>{ticket.subject}</strong><span className="text-xs text-muted-foreground">{STATUS[ticket.status] || ticket.status}</span></div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{ticket.body}</p>
      </Link>)}
    </section>
  </main>;
}
