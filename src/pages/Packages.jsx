import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addToCart, checkout, clearCart, listProducts } from '@/api/plugins/ecommerce';
import { appUrl, redirectToPayment } from '@/api/joorchin';
import Modal from '@/components/site/Modal';
import { SkeletonGrid, StateBox } from '@/components/site/ui';
import { errText, idOf, money, nf, normalizePhone, rowsOf, toToman } from '@/components/site/format';
import { useAsync, useCatalog, useSession, useTitle } from '@/components/site/hooks';

/**
 * Resolves the public frontend URL that the payment provider returns to.
 * For localhost checkout, this must be an HTTPS tunnel or a deployed site URL;
 * the API origin is separate and must never be used as the callback host.
 */
function getCallbackUrl(routePath = '/order-success') {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const publicOrigin = String(
    import.meta.env?.VITE_PUBLIC_URL || import.meta.env?.VITE_APP_URL || import.meta.env?.VITE_SITE_URL || '',
  ).trim();

  if (publicOrigin) {
    let publicUrl;
    try {
      publicUrl = new URL(publicOrigin);
    } catch {
      throw new Error('آدرس بازگشت پرداخت معتبر نیست؛ یک آدرس عمومی HTTPS وارد کنید.');
    }
    if (publicUrl.protocol !== 'https:' || publicUrl.hostname === 'api.joorchin.site') {
      throw new Error('آدرس بازگشت پرداخت باید HTTPS و مربوط به سایت باشد، نه API.');
    }
    const base = `${publicUrl.origin}${publicUrl.pathname.replace(/\/+$/, '')}`;
    const clean = routePath.replace(/^\/+/, '');
    return `${base}/${clean}`;
  }

  if (isLocalhost) {
    throw new Error('برای پرداخت محلی، VITE_PUBLIC_URL را روی آدرس HTTPS تونل سایت یا دامنهٔ منتشرشده تنظیم کنید.');
  }

  return appUrl(routePath);
}

/**
 * Packages and gift cards are sold as digital ecommerce products (tags
 * 'booking-package' / 'gift-card'); payment belongs to the ecommerce checkout.
 * Session credits are activated by the clinic once the order is paid — this page
 * never mints credits itself.
 */
const sold = (tag) => listProducts().then(rowsOf).then((rows) => rows.filter((p) => p.active !== false && (p.tags || []).includes(tag)));

export default function PackagesPage() {
  useTitle('بسته‌ها و کارت هدیه');

  const catalog = useCatalog();
  const products = useAsync(async () => ({ packages: await sold('booking-package'), gifts: await sold('gift-card') }), []);
  const { user } = useSession();
  const [buying, setBuying] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [fieldErr, setFieldErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState('');
  const [placed, setPlaced] = useState(null);

  const services = catalog.data?.services ?? [];
  const packaged = services.filter((s) => s.package?.enabled);
  const productFor = (s) =>
    (products.data?.packages ?? []).find(
      (p) => Number(p.attributes?.sessions) === Number(s.package.sessionCount) && Number(p.attributes?.validityDays) === Number(s.package.validityDays),
    );
  const loading = catalog.loading || products.loading;
  const error = catalog.error || products.error;

  function open(product, label) {
    setBuying({ product, label });
    setFail('');
    setPlaced(null);
    setFieldErr({});
    setForm((f) => ({ name: f.name || user?.name || '', phone: f.phone || normalizePhone(user?.phoneNumber) }));
  }

  async function pay(e) {
    e.preventDefault();
    const phone = normalizePhone(form.phone);
    const fe = {};
    if (form.name.trim().length < 3) fe.name = 'نام و نام خانوادگی را وارد کنید.';
    if (!phone) fe.phone = 'شمارهٔ موبایل معتبر وارد کنید.';
    setFieldErr(fe);
    if (Object.keys(fe).length) return;
    setBusy(true);
    setFail('');
    try {
      const callbackUrl = getCallbackUrl('/order-success');
      await clearCart().catch(() => null);
      await addToCart(idOf(buying.product), 1);
      const order = await checkout({
        customer: { name: form.name.trim(), phone },
        paymentMethod: 'online',
        callbackUrl,
      });
      if (!redirectToPayment(order)) setPlaced(order);
    } catch (err) {
      setFail(errText(err, 'ثبت سفارش انجام نشد. دوباره تلاش کنید.'));
    } finally {
      setBusy(false);
    }
  }

  const gifts = products.data?.gifts ?? [];

  return (
    <>
      <header className="cl-pkg-hero">
        <div className="cl-wrap cl-pkg-hero-grid">
          <div className="cl-pkg-hero-copy cl-rv">
            <p className="cl-eyebrow cl-eyebrow-light">بسته‌های چندجلسه‌ای و کارت هدیه</p>
            <h1>برای مراقبت، یک مسیر پیوسته بچینید</h1>
            <p className="cl-lead cl-pkg-hero-lead">
              جلسات درمانی را در قالب بسته تهیه کنید، هزینهٔ هر جلسه را با تعرفهٔ آزاد مقایسه کنید و زمان مراجعه را با توجه به برنامهٔ خود رزرو کنید.
            </p>
            <div className="cl-pkg-value-strip" role="list" aria-label="مزایای بسته‌های چندجلسه‌ای کلینیک">
              <div className="cl-pkg-value-item" role="listitem">
                <span className="cl-pkg-value-icon" aria-hidden="true">✓</span>
                <span>تا ۳۰٪ صرفه‌جویی در هر جلسه نسبت به تعرفهٔ آزاد</span>
              </div>
              <div className="cl-pkg-value-item" role="listitem">
                <span className="cl-pkg-value-icon" aria-hidden="true">✓</span>
                <span>رزرو روز و ساعت هر جلسه از حساب کاربری</span>
              </div>
              <div className="cl-pkg-value-item" role="listitem">
                <span className="cl-pkg-value-icon" aria-hidden="true">✓</span>
                <span>اعتبار مشخص برای استفاده از جلسات بسته</span>
              </div>
            </div>
          </div>

          <aside className="cl-pkg-hero-art cl-rv" aria-label="راهنمای استفاده از بسته‌های درمانی">
            <div className="cl-pkg-art-orbit" aria-hidden="true" />
            <div className="cl-pkg-pass">
              <div className="cl-pkg-pass-top">
                <span>کلینیک نیلوفر</span>
                <span aria-hidden="true">✦</span>
              </div>
              <div className="cl-pkg-pass-icon" aria-hidden="true">N</div>
              <p className="cl-pkg-pass-kicker">برنامهٔ مراقبت شما</p>
              <h2>جلسه به جلسه، با آرامش</h2>
              <p>جزئیات هر بسته، تعداد جلسات و بازهٔ استفاده را پیش از خرید ببینید.</p>
              <div className="cl-pkg-pass-foot"><span>قابل رزرو آنلاین</span><span>۰۱ — ۰۲ — ۰۳</span></div>
            </div>
            <div className="cl-pkg-art-note"><span aria-hidden="true">✓</span> انتخاب متناسب با برنامهٔ شما</div>
          </aside>
        </div>
      </header>

      <section className="cl-wrap cl-section">
        {/* Step Guide */}
        <div className="cl-pkg-steps" aria-label="مراحل استفاده از بسته‌ها">
          <div className="cl-pkg-step">
            <span className="cl-pkg-step-num" aria-hidden="true">۱</span>
            <div className="cl-pkg-step-text">
              <strong>خرید آنلاین بسته</strong>
              <span>پرداخت سریع از طریق درگاه امن بانکی</span>
            </div>
          </div>
          <div className="cl-pkg-step">
            <span className="cl-pkg-step-num" aria-hidden="true">۲</span>
            <div className="cl-pkg-step-text">
                <strong>فعال‌سازی پس از تأیید سفارش</strong>
                <span>کلینیک اعتبار جلسات را در حساب شما فعال می‌کند</span>
            </div>
          </div>
          <div className="cl-pkg-step">
            <span className="cl-pkg-step-num" aria-hidden="true">۳</span>
            <div className="cl-pkg-step-text">
              <strong>رزرو آزادانهٔ زمان</strong>
              <span>انتخاب متخصص و زمان دلخواه هر جلسه</span>
            </div>
          </div>
        </div>

        {loading ? <SkeletonGrid n={2} cols={2} /> : error ? (
          <StateBox kind="error" title="بسته‌ها دریافت نشد" text={errText(error)} onRetry={() => { catalog.reload(); products.reload(); }} />
        ) : packaged.length ? (
          <div className="cl-grid cl-grid-2">
            {packaged.map((s) => {
              const p = s.package;
              const product = productFor(s);
              const price = product ? product.price : toToman(p.price, s.currency);
              const full = toToman(s.price, s.currency) * Number(p.sessionCount);
              const save = full > 0 ? Math.round((1 - price / full) * 100) : 0;
              const perSession = Math.round(price / Number(p.sessionCount || 1));
              const singleSessionPrice = toToman(s.price, s.currency);
              const diffPerSession = singleSessionPrice - perSession;
              return (
                <article key={idOf(s)} className="cl-pkg-card cl-rv">
                  <div className="cl-pkg-top">
                    <span className="cl-chip">{s.name}</span>
                    <span className="cl-muted cl-small">{nf(s.durationMinutes || 45)} دقیقه هر جلسه</span>
                  </div>

                  <h2>{p.name}</h2>

                  <div className="cl-pkg-price-row">
                    <div className="cl-pkg-price-main">
                      <strong>{nf(price)}</strong>
                      <span>تومان</span>
                    </div>
                    {save > 0 ? (
                      <span className="cl-badge">{nf(save)}٪ صرفه‌جویی اقتصادی</span>
                    ) : null}
                  </div>

                  {/* Signature Breakdown Ribbon */}
                  <div className="cl-pkg-breakdown" aria-label="تحلیل ارزش بسته">
                    <div className="cl-pkg-breakdown-col">
                      <span className="cl-pkg-breakdown-k">تعداد کل جلسات</span>
                      <strong className="cl-pkg-breakdown-v">{nf(p.sessionCount)} جلسه کامل</strong>
                    </div>
                    <div className="cl-pkg-breakdown-col">
                      <span className="cl-pkg-breakdown-k">هزینهٔ هر جلسه</span>
                      <strong className="cl-pkg-breakdown-v">{nf(perSession)} تومان</strong>
                    </div>
                    {diffPerSession > 0 ? (
                      <div className="cl-pkg-breakdown-col">
                        <span className="cl-pkg-breakdown-k">سود در هر جلسه</span>
                        <strong className="cl-pkg-breakdown-diff">{nf(diffPerSession)} تومان ارزان‌تر</strong>
                      </div>
                    ) : null}
                  </div>

                  <ul className="cl-ticks">
                    <li>اعتبار زمانی {nf(p.validityDays)} روز از لحظهٔ خرید</li>
                    <li>رزرو آزاد و منعطف نوبت هر جلسه از بخش حساب کاربری</li>
                    <li>ارزیابی روند و پیگیری مداوم زیر نظر متخصص کلینیک</li>
                  </ul>

                  <div className="cl-actions">
                    {product ? (
                      <button type="button" className="cl-btn cl-btn-primary" onClick={() => open(product, p.name)}>
                        خرید و پرداخت آنلاین
                      </button>
                    ) : (
                      <span className="cl-muted cl-small">خرید آنلاین این بسته هنوز فعال نشده است؛ در کلینیک تهیه کنید.</span>
                    )}
                    <Link className="cl-btn cl-btn-outline" to={`/services/${idOf(s)}`}>
                      دربارهٔ این خدمت
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <StateBox kind="empty" title="فعلاً بستهٔ چندجلسه‌ای فعال نیست" text="می‌توانید هر خدمت را به‌صورت تکی رزرو کنید." action={<Link className="cl-btn cl-btn-primary" to="/book">رزرو نوبت</Link>} />}
      </section>
        {/* Dark Closing CTA Band for Custom Combinations */}
      <section className="cl-cta" aria-label="مشاوره پکیج‌های ترکیبی">
        <div className="cl-wrap cl-rv">
          <p className="cl-eyebrow cl-eyebrow-light">پکیج‌های درمانی اختصاصی</p>
          <h2>نیاز به بستهٔ ترکیبی یا مشاوره دارید؟</h2>
          <p className="cl-lead-cl-lead-package">
            اگر مایلید جلسات لیزر، پاکسازی پوست و ماساژ را در قالب یک دورهٔ جامع شخصی‌سازی‌شده ترکیب کنید، مشاوران کلینیک نیلوفر بهترین برنامه را برای شما تدوین می‌کنند.
          </p>
          <div className="cl-actions" style={{ justifyContent: 'center' }}>
            <Link className="cl-btn cl-btn-rose cl-btn-lg" to="/book">
              رزرو وقت مشاوره حضوری
            </Link>
            <a className="cl-btn cl-btn-glass cl-btn-lg" href="tel:02188888888">
              تماس با مشاوران کلینیک
            </a>
          </div>
        </div>
      </section>
      {gifts.length ? (
        <section className="cl-band">
          <div className="cl-wrap cl-section">
            <div className="cl-sechead"><div><p className="cl-eyebrow">کارت هدیه</p><h2>مراقبت را هدیه بدهید</h2></div></div>
            <div className="cl-grid cl-grid-2">
              {gifts.map((g) => (
                <article key={idOf(g)} className="cl-gift-card cl-rv">
                  <div className="cl-pkg-top">
                    <span className="cl-badge">کارت هدیه اختصاصی</span>
                  </div>
                  <h3>{g.title}</h3>
                  <p className="cl-muted">{g.description}</p>
                  <div className="cl-pkg-price-main">
                    <strong>{money(g.price, g.currency)}</strong>
                  </div>
                  <div className="cl-actions">
                    <button type="button" className="cl-btn cl-btn-rose" onClick={() => open(g, g.title)}>
                      خرید و دریافت کد هدیه
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Modal open={!!buying} onClose={() => setBuying(null)} title={placed ? 'سفارش ثبت شد' : `خرید ${buying?.label ?? ''}`}>
        {placed ? (
          <div className="cl-confirm">
            <p>سفارش شما ثبت شد. پس از تأیید پرداخت، کلینیک خرید شما را فعال می‌کند و در «حساب من» می‌بینید.</p>
            <div className="cl-actions">
              <Link className="cl-btn cl-btn-primary" to="/client?tab=credits">حساب من</Link>
              <button type="button" className="cl-btn cl-btn-ghost" onClick={() => setBuying(null)}>بستن</button>
            </div>
          </div>
        ) : (
          <form onSubmit={pay} noValidate>
            <p className="cl-muted">مبلغ {buying ? money(buying.product.price, buying.product.currency) : ''}؛ پرداخت در درگاه امن آنلاین انجام می‌شود.</p>
            <div className="cl-fields">
              <label className="cl-field"><span>نام و نام خانوادگی</span>
                <input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!fieldErr.name} required />
                {fieldErr.name ? <em className="cl-err">{fieldErr.name}</em> : null}
              </label>
              <label className="cl-field"><span>شمارهٔ موبایل</span>
                <input dir="ltr" inputMode="tel" autoComplete="tel" placeholder="09121234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-invalid={!!fieldErr.phone} required />
                {fieldErr.phone ? <em className="cl-err">{fieldErr.phone}</em> : null}
              </label>
            </div>
            {!user ? <p className="cl-note">برای دیدن جلسات فعال‌شده در حساب خود، با همین شماره <Link to="/auth/login?next=/packages">وارد شوید</Link>.</p> : null}
            {fail ? <p className="cl-err cl-alert" role="alert">{fail}</p> : null}
            <div className="cl-actions">
              <button type="submit" className="cl-btn cl-btn-primary" disabled={busy}>{busy ? 'در حال انتقال به درگاه…' : 'ادامه و پرداخت'}</button>
              <button type="button" className="cl-btn cl-btn-ghost" onClick={() => setBuying(null)}>انصراف</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
