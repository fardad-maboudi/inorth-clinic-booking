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
      {/* Asymmetrical Editorial Split Header */}
      <header className="cl-team-hero">
        <div className="cl-wrap cl-rv">
          <div className="cl-team-split">
            <div className="cl-team-hero-info">
              <p className="cl-eyebrow">کادر پزشکی و درمانی</p>
              <h1>تیم متخصصان و پزشکان کلینیک نیلوفر</h1>
              <p className="cl-lead">
                ما باور داریم زیبایی پایدار، بر پایهٔ علم پزشکی، تخصص آکادمیک و دستان ماهر شکل می‌گیرد. تمامی درمان‌های کلینیک نیلوفر زیر نظر پزشکان پوست، متخصصان زیبایی و کادر بالینی دارای پروانه و با بالاترین استانداردهای ایمنی انجام می‌شود.
              </p>
            </div>

            <div className="cl-team-trust-card" aria-label="اعتبار درمانی و نظام پزشکی">
              <div className="cl-team-trust-top">
                <span className="cl-badge">اصالت و پروانه رسمی</span>
                <span className="cl-muted cl-small">پایش مستمر بالینی</span>
              </div>
              <h2 className="cl-team-trust-title">استانداردهای علمی و مجوزهای بالینی</h2>
              <ul className="cl-team-trust-list">
                <li>
                  <span className="cl-team-trust-check" aria-hidden="true">✓</span>
                  <span>{staff.length ? `${nf(staff.length)} پزشک و کارشناس ارشد دارای پروانه نظام پزشکی` : 'پزشکان و کارشناسان دارای پروانه نظام پزشکی'}</span>
                </li>
                <li>
                  <span className="cl-team-trust-check" aria-hidden="true">✓</span>
                  <span>۱۰۰٪ کادر درمانی دارای دوره‌های تکمیلی بین‌المللی پوست و لیزر</span>
                </li>
                <li>
                  <span className="cl-team-trust-check" aria-hidden="true">✓</span>
                  <span>پایش مستمر پرونده‌های درمانی و بهداشت کامل اتاق‌های درمان</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Main Staff Directory Section */}
      <section className="cl-wrap cl-section">
        <div className="cl-team-filter-bar">
          <FilterBar
            items={specialties}
            value={specialty}
            onChange={setSpecialty}
            label="دسته‌بندی تخصص‌ها"
            allLabel="همه تخصص‌ها"
          />
          {!loading && !error && shownStaff.length ? (
            <span className="cl-team-count-pill" aria-live="polite">
              نمایش {nf(shownStaff.length)} متخصص
            </span>
          ) : null}
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
