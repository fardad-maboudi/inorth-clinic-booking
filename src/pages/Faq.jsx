import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, CircleHelp, Gift, Search } from 'lucide-react';
import { listFaqs } from '@/api/plugins/faq-kb';
import { FaqSkeleton, FaqToggleIcon, StateBox } from '@/components/site/ui';
import { errText, idOf, nf, rowsOf } from '@/components/site/format';
import { useAsync, useTitle } from '@/components/site/hooks';

export default function FaqPage() {
  useTitle('پرسش‌های متداول');
  const q = useAsync(() => listFaqs({ limit: 100 }).then(rowsOf), []);
  const [term, setTerm] = useState('');
  const rows = useMemo(() => {
    const query = term.trim();
    return (q.data ?? []).filter((item) =>
      item.active !== false && (!query || item.question.includes(query) || item.answer.includes(query)),
    );
  }, [q.data, term]);

  return (
    <>
      <header className="cl-faq-hero">
        <div className="cl-wrap cl-faq-hero-inner">
          <div className="cl-faq-hero-copy">
            <p className="cl-eyebrow">مرکز راهنمای نیلوفر</p>
            <h1>پاسخ روشن، پیش از اولین قدم</h1>
            <p className="cl-lead">
              راهنمای رزرو، تغییر نوبت، بسته‌های درمانی و آمادگی پیش از مراجعه را اینجا پیدا کنید.
            </p>
            <div className="cl-faq-hero-stat" aria-live="polite">
              <span>{q.loading ? '…' : nf(rows.length)}</span>
              <span>{term ? 'پاسخ مطابق جست‌وجو' : 'پاسخ برای راهنمایی شما'}</span>
            </div>
          </div>

          <div className="cl-faq-search-panel">
            <div className="cl-faq-search-heading">
              <span className="cl-faq-search-symbol" aria-hidden="true"><Search size={20} /></span>
              <div>
                <strong>در چه موردی راهنمایی می‌خواهید؟</strong>
                <span>یک واژه یا بخشی از پرسش را بنویسید.</span>
              </div>
            </div>
            <div className="cl-faq-search">
              <Search className="cl-faq-search-icon" aria-hidden="true" size={20} />
              <input
                type="search"
                placeholder="مثلاً تغییر زمان نوبت…"
                aria-label="جست‌وجو در پرسش‌ها"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
              />
              {term ? (
                <button
                  type="button"
                  className="cl-faq-search-clear"
                  aria-label="پاک کردن جست‌وجو"
                  onClick={() => setTerm('')}
                >
                  ×
                </button>
              ) : null}
            </div>
            <p className="cl-faq-search-hint">جست‌وجو در عنوان پرسش‌ها و متن پاسخ‌ها</p>
          </div>
        </div>
      </header>

      <section className="cl-wrap cl-section cl-faq-layout">
        <div className="cl-faq-results">
          <div className="cl-faq-results-head">
            <div>
              <p className="cl-eyebrow">راهنمای مراجعه</p>
              <h2>پرسش‌های پرتکرار</h2>
            </div>
            {!q.loading && !q.error ? (
              <span className="cl-faq-results-count" aria-live="polite">{nf(rows.length)} پاسخ</span>
            ) : null}
          </div>

          {q.loading ? (
            <FaqSkeleton n={6} />
          ) : q.error ? (
            <StateBox kind="error" title="پرسش‌ها دریافت نشد" text={errText(q.error)} onRetry={q.reload} />
          ) : rows.length ? (
            <div className="cl-faq cl-faq-indexed">
              {rows.map((item, index) => (
                <details key={idOf(item)} className="cl-card cl-faq-row">
                  <summary>
                    <span className="cl-faq-row-number" aria-hidden="true">{nf(index + 1)}</span>
                    <span className="cl-faq-row-question">{item.question}</span>
                    <FaqToggleIcon />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          ) : (
            <StateBox
              kind="empty"
              title={term ? 'پرسشی با این عبارت پیدا نشد' : 'هنوز پرسشی ثبت نشده است'}
              text={term ? 'عبارت دیگری را جست‌وجو کنید یا از راه‌های ارتباطی با ما در تماس باشید.' : undefined}
              action={term ? (
                <button type="button" className="cl-btn cl-btn-outline cl-btn-sm" onClick={() => setTerm('')}>
                  پاک کردن جست‌وجو
                </button>
              ) : undefined}
            />
          )}
        </div>

        <aside className="cl-faq-help-panel">
          <span className="cl-faq-help-icon" aria-hidden="true"><CircleHelp size={22} /></span>
          <p className="cl-eyebrow">هنوز پرسشی دارید؟</p>
          <h2>از اینجا ادامه دهید</h2>
          <p className="cl-muted">برای پاسخ دقیق‌تر، راه مناسب را انتخاب کنید.</p>
          <div className="cl-faq-help-links">
            <Link to="/book"><CalendarCheck size={18} aria-hidden="true" /><span>رزرو یا تغییر نوبت</span><span aria-hidden="true">‹</span></Link>
            <Link to="/packages"><Gift size={18} aria-hidden="true" /><span>جزئیات بسته‌ها</span><span aria-hidden="true">‹</span></Link>
            <Link to="/contact"><CircleHelp size={18} aria-hidden="true" /><span>تماس با کلینیک</span><span aria-hidden="true">‹</span></Link>
          </div>
          <Link to="/support/tickets" className="cl-btn cl-btn-outline cl-faq-support-link">ثبت درخواست پشتیبانی</Link>
        </aside>
      </section>
    </>
  );
}
