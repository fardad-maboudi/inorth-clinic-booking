import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaqToggleIcon, FilterBar, ServiceCard, ServiceIcon, SkeletonGrid, StateBox } from '@/components/site/ui';
import { errText, idOf, nf } from '@/components/site/format';
import { useCatalog, useTitle } from '@/components/site/hooks';

export default function ServicesPage() {
  useTitle('کاتالوگ خدمات و درمان‌ها');
  const { data, loading, error, reload } = useCatalog();
  const [group, setGroup] = useState('all');

  const services = data?.services ?? [];
  const groups = [...new Set(services.map((service) => service.group).filter(Boolean))];
  const shown = group === 'all' ? services : services.filter((service) => service.group === group);

  return (
    <>
      <header className="cl-services-hero">
        <div className="cl-wrap">
          <div className="cl-services-hero-grid">
            <div className="cl-services-hero-content">
              <p className="cl-eyebrow">راهنمای خدمات نیلوفر</p>
              <h1>مراقبتی که با نیاز پوست شما شروع می‌شود</h1>
              <p className="cl-lead">
                درمان‌های پوست و زیبایی را با بررسی تخصص، زمان و تعرفه انتخاب کنید؛ جزئیات هر خدمت و مسیر رزرو را یک‌جا و روشن ببینید.
              </p>
              <div className="cl-services-hero-points" aria-label="اطلاعات قابل بررسی برای هر خدمت">
                <span>شرح هر درمان</span>
                <span>مدت و تعرفه</span>
                <span>متخصصان ارائه‌دهنده</span>
              </div>
            </div>

            <div className="cl-services-mosaic" role="img" aria-label="تصاویر مراقبت پوست و لیزر در محیط کلینیک">
              <div className="cl-services-photo cl-services-photo-main">
                <img src="/images/skincare-facial-care.avif" alt="" fetchPriority="high" decoding="async" />
              </div>
              <div className="cl-services-photo cl-services-photo-laser">
                <img src="/images/skin-laser-care.avif" alt="" loading="lazy" decoding="async" />
              </div>
              <div className="cl-services-mosaic-note">
                <ServiceIcon group="پوست و مو" />
                <span><strong>انتخاب آگاهانه</strong><small>از مشاوره تا رزرو خدمت</small></span>
              </div>
            </div>
          </div>

          <div className="cl-services-toolbar">
            <div className="cl-services-toolbar-label">
              <span className="cl-services-toolbar-kicker">جست‌وجوی مسیر مناسب</span>
              <span className="cl-muted cl-small">دسته‌بندی خدمات</span>
            </div>
            <FilterBar
              items={groups}
              value={group}
              onChange={setGroup}
              label="دسته‌بندی خدمات"
              allLabel="همهٔ خدمات"
            />
            {!loading && !error ? (
              <span className="cl-services-count-badge" aria-live="polite">
                {group === 'all'
                  ? `${nf(services.length)} خدمت`
                  : `${nf(shown.length)} خدمت در ${group}`}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <section className="cl-wrap cl-section cl-services-directory" aria-label="فهرست خدمات کلینیک">
        {loading ? (
          <SkeletonGrid n={6} cols={3} />
        ) : error ? (
          <StateBox kind="error" title="خدمات دریافت نشد" text={errText(error)} onRetry={reload} />
        ) : shown.length ? (
          group === 'all' ? (
            groups.map((category) => {
              const groupServices = services.filter((service) => service.group === category);
              if (!groupServices.length) return null;
              return (
                <div key={category} className="cl-services-group">
                  <div className="cl-services-group-head">
                    <div>
                      <p className="cl-eyebrow">بر پایهٔ نیاز شما</p>
                      <h2>{category}</h2>
                    </div>
                    <span className="cl-services-group-count">{nf(groupServices.length)} خدمت</span>
                  </div>
                  <div className="cl-grid cl-grid-3 cl-services-grid">
                    {groupServices.map((service) => (
                      <ServiceCard
                        key={idOf(service)}
                        service={service}
                        staffCount={service.resourceIds?.length}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="cl-grid cl-grid-3 cl-services-grid" key={group}>
              {shown.map((service) => (
                <ServiceCard
                  key={idOf(service)}
                  service={service}
                  staffCount={service.resourceIds?.length}
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
              <button type="button" className="cl-btn cl-btn-outline" onClick={() => setGroup('all')}>
                نمایش همهٔ خدمات
              </button>
            }
          />
        )}
      </section>

      <section className="cl-services-consult" aria-label="مشاوره برای انتخاب درمان">
        <div className="cl-wrap cl-services-consult-inner">
          <div>
            <p className="cl-eyebrow cl-eyebrow-light">پیش از انتخاب درمان</p>
            <h2>برای پوست شما، کدام مسیر مناسب‌تر است؟</h2>
            <p>
              در جلسهٔ مشاوره، پزشک با بررسی نوع پوست و نیازهای شما دربارهٔ گزینه‌های درمان و تعداد جلسات راهنمایی می‌کند.
            </p>
          </div>
          <div className="cl-services-consult-actions">
            <Link className="cl-btn cl-btn-rose cl-btn-lg" to="/book">رزرو مشاوره</Link>
            <a className="cl-btn cl-btn-glass cl-btn-lg" href="tel:02188888888">تماس با پذیرش</a>
          </div>
        </div>
      </section>

      <section className="cl-wrap cl-section" aria-label="پرسش‌های متداول خدمات">
        <div className="cl-sechead">
          <div>
            <p className="cl-eyebrow">پیش از مراجعه</p>
            <h2>چند نکته دربارهٔ روند درمان</h2>
          </div>
          <Link className="cl-link" to="/faq">مشاهدهٔ همهٔ پرسش‌ها ›</Link>
        </div>

        <div className="cl-faq cl-services-faq">
          <details className="cl-card">
            <summary>آیا پیش از خدمات لیزر یا پوست نیاز به جلسهٔ مشاوره است؟<FaqToggleIcon /></summary>
            <p>بله، در اولین مراجعه پروندهٔ سلامت شما تکمیل و نوع پوست توسط پزشک بررسی می‌شود تا مناسب‌ترین تنظیمات دستگاه یا پروتکل درمانی تعیین شود.</p>
          </details>
          <details className="cl-card">
            <summary>فاصلهٔ زمانی بین جلسات درمانی چقدر است؟<FaqToggleIcon /></summary>
            <p>بسته به نوع خدمت، فاصلهٔ جلسات متفاوت است. متخصص در پایان جلسه زمان مناسب مراجعهٔ بعدی را به شما اعلام می‌کند.</p>
          </details>
          <details className="cl-card">
            <summary>آیا امکان لغو یا تغییر زمان نوبت وجود دارد؟<FaqToggleIcon /></summary>
            <p>بله، تا ۲۴ ساعت پیش از شروع نوبت می‌توانید از بخش «حساب من» یا با تماس با کلینیک، زمان نوبت خود را تغییر دهید یا لغو کنید.</p>
          </details>
          <details className="cl-card">
            <summary>تفاوت جلسات تکی با بسته‌های چندجلسه‌ای چیست؟<FaqToggleIcon /></summary>
            <p>بسته‌های چندجلسه‌ای با توجه به خدمت، تعداد جلسات و اعتبار زمانی مشخصی دارند. جزئیات هر بسته را در بخش بسته‌ها ببینید.</p>
          </details>
        </div>
      </section>
    </>
  );
}
