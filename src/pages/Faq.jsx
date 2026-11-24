import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listFaqs } from '@/api/plugins/faq-kb';
import { FaqSkeleton, FaqToggleIcon, PageHead, StateBox } from '@/components/site/ui';
import { errText, idOf, rowsOf } from '@/components/site/format';
import { useAsync, useTitle } from '@/components/site/hooks';

export default function FaqPage() {
  useTitle('پرسش‌های متداول');
  const q = useAsync(() => listFaqs({ limit: 100 }).then(rowsOf), []);
  const [term, setTerm] = useState('');
  const rows = useMemo(() => {
    const t = term.trim();
    return (q.data ?? []).filter((f) => f.active !== false && (!t || f.question.includes(t) || f.answer.includes(t)));
  }, [q.data, term]);

  return (
    <>
      <PageHead eyebrow="راهنما" title="پرسش‌های متداول" lead="پاسخ رایج‌ترین پرسش‌ها دربارهٔ رزرو، لغو نوبت، بسته‌ها و یادآوری." />
      <section className="cl-wrap cl-section cl-narrow">
        <div className="cl-faq-search">
          <svg
            className="cl-faq-search-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="جست‌وجو در پرسش‌ها…"
            aria-label="جست‌وجو در پرسش‌ها"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          {term ? (
            <button
              type="button"
              className="cl-faq-search-clear"
              aria-label="پاک کردن جست‌وجو"
              onClick={() => setTerm('')}
            >
              ✕
            </button>
          ) : null}
        </div>

        {q.loading ? (
          <FaqSkeleton n={6} />
        ) : q.error ? (
          <StateBox kind="error" title="پرسش‌ها دریافت نشد" text={errText(q.error)} onRetry={q.reload} />
        ) : rows.length ? (
          <div className="cl-faq">
            {rows.map((f) => (
              <details key={idOf(f)} className="cl-card">
                <summary>{f.question}<FaqToggleIcon /></summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <StateBox
            kind="empty"
            title={term ? 'پرسشی با این عبارت پیدا نشد' : 'هنوز پرسشی ثبت نشده است'}
            text={term ? 'می‌توانید عبارت جست‌وجو را تغییر دهید یا مستقیماً با پشتیبانی در ارتباط باشید.' : undefined}
            action={term ? (
              <button type="button" className="cl-btn cl-btn-outline cl-btn-sm" onClick={() => setTerm('')}>
                پاک کردن جست‌وجو
              </button>
            ) : undefined}
          />
        )}
        <p className="cl-muted cl-gap">پاسخ خود را پیدا نکردید؟ <Link to="/support/tickets">از پشتیبانی بپرسید</Link> یا <Link to="/contact">تماس بگیرید</Link>.</p>
      </section>
    </>
  );
}
