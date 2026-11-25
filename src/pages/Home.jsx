import { Link } from 'react-router-dom';
import HeroSlider from '@/components/site/HeroSlider';
import { listFaqs } from '@/api/plugins/faq-kb';
import { listSlots } from '@/api/plugins/bookings';
import Reviews from '@/components/site/Reviews';
import { FaqSkeleton, FaqToggleIcon, SectionHead, ServiceCard, SkeletonGrid, StaffCard, StateBox } from '@/components/site/ui';
import { dayKey, errText, fmtFullDate, fmtTime, idOf, money, nf, rowsOf } from '@/components/site/format';
import { useAsync, useCatalog, useTitle } from '@/components/site/hooks';

function NextSlot() {
  const q = useAsync(
    () =>
      listSlots().then((r) => {
        const rows = rowsOf(r).filter((s) => s.available !== false).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
        const k = rows[0] ? dayKey(rows[0].startsAt) : null;
        return { first: rows[0], today: rows.filter((r) => dayKey(r.startsAt) === k).slice(0, 6) };
      }),
    [],
  );
  const s = q.data?.first;
  return (
    <aside
      id="quick-booking"
      className="cl-hero-card cl-hero-slot-card"
      aria-label="نزدیک‌ترین نوبت خالی کلینیک"
      aria-live="polite"
      aria-busy={q.loading}
    >
      <p className="cl-hero-card-k">نزدیک‌ترین نوبت خالی</p>
      {q.loading ? <p className="cl-hero-card-v">در حال بررسی…</p> : q.error ? (
        <>
          <p className="cl-hero-card-v">فعلاً نوبت‌ها بارگذاری نشد</p>
          <p className="cl-hero-card-s">برای دیدن زمان‌های دیگر، نوبت‌دهی را باز کنید.</p>
          <Link className="cl-btn cl-btn-outline" to="/book">مشاهدهٔ زمان‌های نوبت</Link>
        </>
      ) : s ? (
        <>
          <p className="cl-hero-card-v">{fmtFullDate(s.startsAt)}</p>
          <p className="cl-hero-card-s">اولین ساعت خالی {fmtTime(s.startsAt)} ({s.title})</p>
          <div className="cl-hero-times" role="group" aria-label="ساعت‌های خالی">
            {q.data.today.map((t) => (
              <Link
                key={idOf(t)}
                to={`/book?service=${t.service}&staff=${t.resource}&slot=${idOf(t)}`}
                state={{ slot: t }}
                aria-label={`رزرو نوبت ${s?.title || 'کلینیک'} در ساعت ${fmtTime(t.startsAt)}`}
              >
                {fmtTime(t.startsAt)}
              </Link>
            ))}
          </div>
          <Link className="cl-btn cl-btn-rose" to="/book">انتخاب زمان دلخواه</Link>
        </>
      ) : (
        <>
          <p className="cl-hero-card-v">فعلاً نوبت خالی نداریم</p>
          <p className="cl-hero-card-s">روز دیگری را در تقویم نوبت‌دهی بررسی کنید.</p>
          <Link className="cl-btn cl-btn-outline" to="/book">مشاهدهٔ تقویم نوبت‌ها</Link>
        </>
      )}
    </aside>
  );
}

export default function Home() {
  useTitle('');
  const catalog = useCatalog();
  const faqs = useAsync(() => listFaqs({ limit: 4 }).then(rowsOf), []);
  const services = catalog.data?.services ?? [];
  const staff = catalog.data?.staff ?? [];
  const packaged = services.filter((s) => s.package?.enabled);

  return (
    <>
      <HeroSlider slotCard={<NextSlot />} />

      {/* <section className="cl-trust-strip" aria-label="مزیت‌های رزرو در کلینیک نیلوفر">
        <div className="cl-wrap">
          <ul className="cl-trust-list">
            <li>
              <span className="cl-trust-icon" aria-hidden="true">✓</span>
              <span>
                {catalog.loading ? (
                  <span className="cl-trust-skel" aria-label="در حال بارگذاری تعداد خدمات" />
                ) : catalog.error ? 'خدمات تخصصی' : `${nf(services.length)} خدمت تخصصی`}
              </span>
            </li>
            <li>
              <span className="cl-trust-icon" aria-hidden="true">✓</span>
              <span>
                {catalog.loading ? (
                  <span className="cl-trust-skel" aria-label="در حال بارگذاری تعداد متخصصان" />
                ) : catalog.error ? 'تیم متخصصان' : `${nf(staff.length)} متخصص`}
              </span>
            </li>
            <li>
              <span className="cl-trust-icon" aria-hidden="true">✓</span>
              <span>رزرو آنلاین در هر ساعت</span>
            </li>
            <li>
              <span className="cl-trust-icon" aria-hidden="true">✓</span>
              <span>پیگیری نوبت‌ها از حساب کاربری</span>
            </li>
          </ul>
        </div>
      </section> */}

      <section className="cl-section cl-wrap">
        <SectionHead
          eyebrow="خدمات"
          title="مراقبت‌هایی که برای شما می‌چینیم"
          moreTo="/services"
          moreLabel="همهٔ خدمات"
        />
        {catalog.loading ? <SkeletonGrid cols={3} /> : catalog.error ? (
          <StateBox kind="error" title="خدمات دریافت نشد" text={errText(catalog.error)} onRetry={catalog.reload} />
        ) : services.length ? (
          <div className="cl-services-flex">
            {services.slice(0, 3).map((s) => <ServiceCard key={idOf(s)} service={s} staffCount={s.resourceIds?.length} compact />)}
          </div>
        ) : <StateBox kind="empty" title="به‌زودی خدمات جدید اضافه می‌شود" />}
      </section>

      <section className="cl-band">
        <div className="cl-wrap cl-section">
          <SectionHead
            eyebrow="تیم ما"
            title="متخصصانی که به آن‌ها اعتماد می‌کنید"
            moreTo="/team"
            moreLabel="آشنایی با تیم"
          />
          {catalog.loading ? <SkeletonGrid n={4} cols={4} /> : catalog.error ? (
            <StateBox kind="error" title="فهرست تیم دریافت نشد" onRetry={catalog.reload} />
          ) : staff.length ? (
            <div className="cl-staffrow">
              {staff.map((p) => (
                <StaffCard key={idOf(p)} person={p} services={services.filter((s) => s.resourceIds?.includes(idOf(p)))} />
              ))}
            </div>
          ) : <StateBox kind="empty" title="اطلاعات تیم به‌زودی تکمیل می‌شود" />}
        </div>
      </section>

      {packaged.length ? (
        <section className="cl-section cl-wrap">
          <SectionHead
            eyebrow="بسته‌های چندجلسه‌ای"
            title="مطمئن‌تر و مقرون‌به‌صرفه‌تر"
            moreTo="/packages"
            moreLabel="همهٔ بسته‌ها"
          />
          <div className="cl-grid cl-grid-2 cl-pkg-teaser-grid">
            {packaged.map((s) => {
              const p = s.package;
              const full = Number(s.price) * Number(p.sessionCount);
              const save = full > 0 ? Math.round((1 - Number(p.price) / full) * 100) : 0;
              return (
                <article key={idOf(s)} className="cl-card cl-pkg-teaser cl-rv">
                  <div className="cl-pkg-teaser-top">
                    <span className="cl-chip">{s.name}</span>
                    {save > 0 ? (
                      <span className="cl-badge cl-pkg-teaser-badge">
                        {nf(save)}٪ صرفه‌جویی
                      </span>
                    ) : null}
                  </div>

                  <div className="cl-pkg-teaser-body">
                    <h3 className="cl-pkg-teaser-title">{p.name}</h3>
                    <div className="cl-pkg-teaser-specs">
                      <span className="cl-pkg-spec-pill">{nf(p.sessionCount)} جلسه درمانی</span>
                      <span className="cl-pkg-spec-dot" aria-hidden="true">·</span>
                      <span className="cl-pkg-spec-pill">اعتبار {nf(p.validityDays)} روز</span>
                    </div>
                  </div>

                  <div className="cl-pkg-teaser-foot">
                    <div className="cl-pkg-teaser-price">
                      <span className="cl-pkg-teaser-price-k">قیمت کل دوره</span>
                      <strong className="cl-pkg-teaser-price-v">{money(p.price, s.currency)}</strong>
                    </div>
                    <Link className="cl-btn cl-btn-sm cl-btn-outline cl-pkg-teaser-btn" to="/packages">
                      جزئیات و خرید
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="cl-band cl-band-reviews">
        <div className="cl-wrap cl-section">
          <SectionHead
            eyebrow="تجربهٔ مراجعان"
            title="آنچه مراجعان می‌گویند"
            light
          />
          {catalog.loading ? <StateBox /> : <Reviews targetIds={['clinic', ...services.map(idOf)]} limit={3} />}
        </div>
      </section>

      <section className="cl-section cl-wrap">
        <SectionHead
          eyebrow="پرسش‌های متداول"
          title="پیش از رزرو، شاید بپرسید"
          moreTo="/faq"
          moreLabel="همهٔ پرسش‌ها"
        />
        {faqs.loading ? (
          <FaqSkeleton n={4} />
        ) : faqs.error ? (
          <StateBox kind="error" title="پرسش‌ها دریافت نشد" onRetry={faqs.reload} />
        ) : faqs.data.length ? (
          <div className="cl-faq">
            {faqs.data.map((f) => (
              <details key={idOf(f)} className="cl-card cl-rv">
                <summary>{f.question}<FaqToggleIcon /></summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        ) : <StateBox kind="empty" title="هنوز پرسشی ثبت نشده است" />}
      </section>

      <section className="cl-cta">
        <div className="cl-wrap cl-rv">
          <p className="cl-eyebrow cl-eyebrow-light">قدم بعدی، با خیال راحت</p>
          <h2>آمادهٔ مراقبت از خودتان هستید؟</h2>
          <p>زمان‌های خالی را به‌روز ببینید و نوبت مناسب خودتان را آنلاین انتخاب کنید.</p>
          <div className="cl-actions cl-home-cta-actions">
            <Link className="cl-btn cl-btn-rose cl-btn-lg" to="/book">رزرو نوبت</Link>
            <Link className="cl-btn cl-btn-glass cl-btn-lg" to="/services">مشاهدهٔ خدمات</Link>
          </div>
        </div>
      </section>
    </>
  );
}
