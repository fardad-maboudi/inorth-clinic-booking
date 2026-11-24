import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBotLink } from '@/api/plugins/telegram';

export default function TelegramSubscribe() {
  const [state, setState] = useState({ loading: true, href: null, error: '' });

  useEffect(() => {
    getBotLink('updates')
      .then((href) => setState({ loading: false, href, error: '' }))
      .catch((error) =>
        setState({ loading: false, href: null, error: error?.message || 'اتصال به تلگرام ممکن نشد.' }),
      );
  }, []);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12" dir="rtl">
      <section className="w-full rounded-3xl border border-neutral-200 bg-surface p-7 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-accent-ink">اعلان‌های سریع</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink">خبرها را در تلگرام بگیر</h1>
        <p className="mx-auto mt-4 max-w-xl leading-8 text-muted">
          با یک لمس عضو ربات رسمی این سایت شو تا خبرهای مهم و به‌روزرسانی‌ها را بدون تأخیر دریافت کنی.
        </p>
        {state.loading ? (
          <p className="mt-8 text-muted" role="status" aria-busy="true">در حال بررسی اتصال تلگرام…</p>
        ) : state.href ? (
          <a
            href={state.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-7 py-3 font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            دریافت خبرها در تلگرام
          </a>
        ) : (
          <div className="mt-8 rounded-2xl bg-neutral-50 p-5">
            <p className="text-ink" role={state.error ? 'alert' : undefined}>
              {state.error || 'ربات تلگرام این سایت هنوز فعال نشده است.'}
            </p>
            <Link className="mt-4 inline-block text-accent-ink underline underline-offset-4" to="/">بازگشت به صفحه اصلی</Link>
          </div>
        )}
      </section>
    </main>
  );
}
