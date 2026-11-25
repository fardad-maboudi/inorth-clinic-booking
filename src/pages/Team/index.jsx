import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterBar, SkeletonGrid, StaffCard, StateBox } from '@/components/site/ui';
import { errText, idOf, nf } from '@/components/site/format';
import { useCatalog, useTitle } from '@/components/site/hooks';

export default function TeamPage() {
  useTitle('تیم متخصصان و پزشکان');
  const { data, loading, error, reload } = useCatalog();
  const [specialty, setSpecialty] = useState('all');

  const staff = useMemo(() => data?.staff ?? [], [data]);
  const services = useMemo(() => data?.services ?? [], [data]);

  // Dynamically extract unique specialties from real staff assignments and service groups
  const specialties = useMemo(() => {
    const set = new Set();
    for (const p of staff) {
      const personServices = services.filter((s) => s.resourceIds?.includes(idOf(p)));
      for (const s of personServices) {
        if (s.group) set.add(s.group);
      }
      if (p.group) set.add(p.group);
      if (p.specialty) set.add(p.specialty);
    }
    return [...set];
  }, [staff, services]);

  const shownStaff = useMemo(() => {
    if (specialty === 'all') return staff;
    return staff.filter((p) => {
      const personServices = services.filter((s) => s.resourceIds?.includes(idOf(p)));
      return (
        personServices.some((s) => s.group === specialty) ||
        p.group === specialty ||
        p.specialty === specialty
      );
    });
  }, [staff, services, specialty]);

  return (
    <>
      <header className="cl-team-hero">
        <div className="cl-wrap cl-team-hero-grid">
          <div className="cl-team-hero-info cl-rv">
            <p className="cl-eyebrow">کادر پزشکی و درمانی</p>
            <h1>متخصصانی که با دقت، کنار شما هستند</h1>
            <p className="cl-lead">
              زیبایی پایدار با شناخت دقیق نیازهای پوست آغاز می‌شود. با تیم درمانی کلینیک نیلوفر آشنا شوید و مسیر مراقبت مناسب خود را با همراهی متخصصان انتخاب کنید.
            </p>
            <div className="cl-team-hero-facts" aria-label="اطلاعات تیم درمانی">
              <div><strong>{loading ? '…' : error ? '—' : nf(staff.length)}</strong><span>عضو تیم درمانی</span></div>
              <div><strong>پیش از درمان</strong><span>ارزیابی نیازهای پوست</span></div>
            </div>
            <div className="cl-team-hero-actions">
              <Link className="cl-btn cl-btn-rose" to="/book">مشاوره و رزرو نوبت</Link>
              <Link className="cl-team-services-link" to="/services">آشنایی با خدمات ›</Link>
            </div>
          </div>

          <div className="cl-team-hero-media cl-rv">
            <img src="/images/clinic-team-consultation.jpg" alt="مشاورهٔ پوست در فضای کلینیک" fetchPriority="high" />
            <div className="cl-team-image-caption">
              <span>رویکرد نیلوفر</span>
              <strong>تخصص، دقت و همراهی در هر مرحله</strong>
            </div>
            <aside className="cl-team-trust-card" aria-label="تعهدات تیم درمانی">
              <span className="cl-team-trust-check" aria-hidden="true">✓</span>
              <div>
                <strong>ارزیابی پیش از اقدام</strong>
                <span>انتخاب درمان با توجه به نیاز و سوابق سلامت شما</span>
              </div>
            </aside>
          </div>
        </div>
      </header>

      <section className="cl-wrap cl-section cl-team-directory">
        <div className="cl-team-directory-head">
          <div>
            <p className="cl-eyebrow">فهرست تیم</p>
            <h2>آشنایی با متخصصان کلینیک</h2>
            <p className="cl-muted">تخصص را انتخاب کنید تا اعضای مرتبط با همان حوزه را ببینید.</p>
          </div>
          {!loading && !error ? (
            <span className="cl-team-count-pill" aria-live="polite">{nf(shownStaff.length)} متخصص</span>
          ) : null}
        </div>
        <div className="cl-team-filter-bar">
          <FilterBar
            items={specialties}
            value={specialty}
            onChange={setSpecialty}
            label="دسته‌بندی تخصص‌ها"
            allLabel="همه تخصص‌ها"
          />
        </div>

        {loading ? (
          <SkeletonGrid n={4} cols={4} />
        ) : error ? (
          <StateBox kind="error" title="فهرست تیم دریافت نشد" text={errText(error)} onRetry={reload} />
        ) : shownStaff.length ? (
          <div className="cl-grid cl-grid-4">
            {shownStaff.map((p) => (
              <StaffCard
                key={idOf(p)}
                person={p}
                services={services.filter((s) => s.resourceIds?.includes(idOf(p)))}
              />
            ))}
          </div>
        ) : (
          <StateBox
            kind="empty"
            title="متخصصی در این دسته‌بندی یافت نشد"
            text="می‌توانید فیلتر را پاک کنید تا همهٔ متخصصان کلینیک را ببینید."
            action={
              <button
                type="button"
                className="cl-btn cl-btn-outline"
                onClick={() => setSpecialty('all')}
              >
                نمایش همه متخصصان
              </button>
            }
          />
        )}
      </section>

      {/* Signature Medical Board & Care Standards Band (Deep Dark) */}
      <section className="cl-standards-band" aria-label="منشور اخلاقی و استانداردهای بالینی کلینیک">
        <div className="cl-wrap cl-rv">
          <div className="cl-sechead cl-sechead-light">
            <div>
              <p className="cl-eyebrow cl-eyebrow-light">منشور اخلاقی و تعهدات بالینی</p>
              <h2>استانداردهای مراقبت در کلینیک نیلوفر</h2>
              <p className="cl-lead cl-lead-light">
                تعهد کادر پزشکی ما به سلامت، شفافیت تشخیصی و حفظ آرامش خاطر شما بالاتر از هر اولویت دیگری است.
              </p>
            </div>
          </div>

          <div className="cl-standards-grid">
            <div className="cl-standard-card">
              <div className="cl-standard-icon" aria-hidden="true">۱</div>
              <h3>دستگاه‌های تاییدشده FDA و CE</h3>
              <p>تمامی تجهیزات لیزر و پوست دارای تاییدیه‌های معتبر بین‌المللی، کالیبراسیون منظم دوره‌ای و گواهی بازرسی رسمی هستند.</p>
            </div>

            <div className="cl-standard-card">
              <div className="cl-standard-icon" aria-hidden="true">۲</div>
              <h3>معاینه و ارزیابی پیش از اقدام</h3>
              <p>هیچ درمان یا فرآیندی بدون ارزیابی نوع پوست، تحلیل سوابق سلامت و توضیح کامل گزینه‌های درمان آغاز نمی‌شود.</p>
            </div>

            <div className="cl-standard-card">
              <div className="cl-standard-icon" aria-hidden="true">۳</div>
              <h3>مواد مصرفی پلمپ و هولوگرام‌دار</h3>
              <p>کوکتل‌های مزوتراپی، فیلرها و بوتاکس‌ها همگی دارای اصالت‌سنجی وزارت بهداشت بوده و در حضور بیمار آنباکس می‌شوند.</p>
            </div>

            <div className="cl-standard-card">
              <div className="cl-standard-icon" aria-hidden="true">۴</div>
              <h3>پشتیبانی و مراقبت پس از درمان</h3>
              <p>کادر پشتیبانی بالینی تا تثبیت کامل نتایج، وضعیت ترمیم پوست و میزان رضایت شما را پایش و پیگیری می‌کنند.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Light Guidance & Consultation Band */}
      <section className="cl-band" aria-label="مشاوره برای انتخاب پزشک">
        <div className="cl-wrap cl-section cl-rv">
          <div className="cl-sechead">
            <div>
              <p className="cl-eyebrow">مشاورهٔ انتخاب درمان</p>
              <h2>نیاز به راهنمایی در انتخاب پزشک یا خدمت دارید؟</h2>
              <p className="cl-lead">
                اگر مطمئن نیستید کدام پزشک یا روش برای نیاز پوستی شما مناسب‌تر است، مشاوران پذیرش کلینیک با کمال میل شما را راهنمایی می‌کنند.
              </p>
            </div>
          </div>

          <div className="cl-actions" style={{ justifyContent: 'center' }}>
            <a className="cl-btn cl-btn-primary cl-btn-lg" href="tel:02188888888">
              تماس تلفنی با مشاوران پذیرش
            </a>
            <Link className="cl-btn cl-btn-outline cl-btn-lg" to="/book">
              رزرو وقت معاینه و مشاوره حضوری
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
