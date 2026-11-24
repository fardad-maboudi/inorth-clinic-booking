import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterBar, ServiceCard, SkeletonGrid, StateBox } from '@/components/site/ui';
import { errText, idOf, nf } from '@/components/site/format';
import { useCatalog, useTitle } from '@/components/site/hooks';

export default function ServicesPage() {
  useTitle('کاتالوگ خدمات و درمان‌ها');
  const { data, loading, error, reload } = useCatalog();
  const [group, setGroup] = useState('all');

  const services = data?.services ?? [];
  const groups = [...new Set(services.map((s) => s.group).filter(Boolean))];
  const shown = group === 'all' ? services : services.filter((s) => s.group === group);

  return (
    <>
      {/* Compact Functional Catalog Header */}
      <header className="cl-services-hero">
        <div className="cl-wrap cl-rv">
          <div className="cl-services-hero-content">
            <p className="cl-eyebrow">کاتالوگ خدمات و درمان‌ها</p>
            <h1>خدمات تخصصی کلینیک نیلوفر</h1>
            <p className="cl-lead">
              بررسی مدت‌زمان، تعرفه و متخصصان ارائه‌دهندهٔ هر خدمت در یک نگاه؛ خدمت مورد نظر خود را انتخاب کرده و مستقیماً نوبت بگیرید.
            </p>
          </div>

          <div className="cl-services-toolbar">
            <FilterBar
              items={groups}
              value={group}
              onChange={setGroup}
              label="دسته‌بندی خدمات"
              allLabel="همه خدمات"
            />
            {!loading && !error && (
              <span className="cl-services-count-badge" aria-live="polite">
                {group === 'all'
                  ? `نمایش همهٔ ${nf(services.length)} خدمت کلینیک`
                  : `نمایش ${nf(shown.length)} خدمت در دستهٔ ${group}`}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Services Catalog Section */}
      <section className="cl-wrap cl-section">
        {loading ? (
          <SkeletonGrid n={6} cols={3} />
        ) : error ? (
          <StateBox kind="error" title="خدمات دریافت نشد" text={errText(error)} onRetry={reload} />
        ) : shown.length ? (
          group === 'all' ? (
            /* Categorized Group Directory when showing all */
            groups.map((g) => {
              const groupServices = services.filter((s) => s.group === g);
              if (!groupServices.length) return null;
              return (
                <div key={g} className="cl-services-group">
                  <div className="cl-services-group-head">
                    <h2>{g}</h2>
                    <span className="cl-services-group-count">{nf(groupServices.length)} خدمت فعال</span>
                  </div>
                  <div className="cl-grid cl-grid-3 cl-services-grid">
                    {groupServices.map((s) => (
                      <ServiceCard
                        key={idOf(s)}
                        service={s}
                        staffCount={s.resourceIds?.length}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            /* Filtered Grid for selected category */
            <div className="cl-grid cl-grid-3 cl-services-grid" key={group}>
              {shown.map((s) => (
                <ServiceCard
                  key={idOf(s)}
                  service={s}
                  staffCount={s.resourceIds?.length}
                />
              ))}
            </div>
          )
        ) : (
          <StateBox
            kind="empty"
            title="خدمتی در این دسته موجود نیست"
            text="می‌توانید فیلتر را پاک کنید تا همهٔ خدمات کلینیک را مشاهده کنید."
            action={
              <button
                type="button"
                className="cl-btn cl-btn-outline"
                onClick={() => setGroup('all')}
              >
                نمایش همهٔ خدمات
              </button>
            }
          />
        )}
      </section>

      {/* Consultation Guidance Band */}
      <section className="cl-band" aria-label="مشاوره برای انتخاب درمان">
        <div className="cl-wrap cl-section cl-rv">
          <div className="cl-sechead">
            <div>
              <p className="cl-eyebrow">مشاورهٔ تخصصی پوست و زیبایی</p>
              <h2>نمی‌دانید کدام درمان برای پوست شما مناسب‌تر است؟</h2>
              <p className="cl-lead">
                پزشکان و کارشناسان کلینیک نیلوفر پیش از هر اقدام درمانی، با آنالیز دقیق پوست و شرح نیازهای شما، مناسب‌ترین پروتکل درمانی و تعداد جلسات لازم را پیشنهاد می‌کنند.
              </p>
            </div>
          </div>

          <div className="cl-actions" style={{ justifyContent: 'center' }}>
            <Link className="cl-btn cl-btn-primary cl-btn-lg" to="/book">
              رزرو وقت معاینه و آنالیز پوست
            </Link>
            <a className="cl-btn cl-btn-outline cl-btn-lg" href="tel:02188888888">
              تماس با مشاوران پذیرش کلینیک
            </a>
          </div>
        </div>
      </section>

      {/* Clinical FAQ Light Section */}
      <section className="cl-wrap cl-section" aria-label="پرسش‌های متداول خدمات">
        <div className="cl-sechead">
          <div>
            <p className="cl-eyebrow">پرسش‌های متداول خدمات</p>
            <h2>نکات مهم پیش و پس از درمان</h2>
          </div>
          <Link className="cl-link" to="/faq">
            مشاهدهٔ تمام پرسش‌های متداول ›
          </Link>
        </div>

        <div className="cl-faq">
          <details className="cl-card cl-rv">
            <summary>آیا پیش از خدمات لیزر یا پوست نیاز به جلسهٔ مشاوره است؟</summary>
            <p>بله، در اولین مراجعه به کلینیک نیلوفر، پروندهٔ سلامت شما تکمیل و نوع پوست توسط پزشک بررسی می‌شود تا مناسب‌ترین تنظیمات دستگاه یا پروتکل درمانی تعیین گردد.</p>
          </details>

          <details className="cl-card cl-rv">
            <summary>فاصلهٔ زمانی بین جلسات درمانی چقدر است؟</summary>
            <p>بسته به نوع خدمت (لیزر، مزوتراپی یا پاکسازی عمیق)، فواصل جلسات معمولاً بین ۳ تا ۶ هفته متغیر است. متخصص در پایان جلسه زمان بهینه را به شما اعلام می‌کند.</p>
          </details>

          <details className="cl-card cl-rv">
            <summary>آیا امکان لغو یا تغییر زمان نوبت وجود دارد؟</summary>
            <p>بله، تا ۲۴ ساعت پیش از شروع نوبت می‌توانید از بخش «حساب من» یا تماس با کلینیک، زمان نوبت خود را بدون هیچ هزینه‌ای تغییر دهید یا لغو کنید.</p>
          </details>

          <details className="cl-card cl-rv">
            <summary>تفاوت جلسات تکی با بسته‌های چندجلسه‌ای چیست؟</summary>
            <p>بسته‌های چندجلسه‌ای شامل تا ۳۰٪ صرفه‌جویی اقتصادی نسبت به جلسهٔ تکی هستند و اعتبار زمانی طولانی برای رزرو آزادانهٔ جلسات در اختیارتان می‌گذارند.</p>
          </details>
        </div>
      </section>
    </>
  );
}
