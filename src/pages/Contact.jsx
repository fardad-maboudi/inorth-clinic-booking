import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Send,
  Sparkles,
  Car,
  Train,
} from 'lucide-react';
import { PageHead } from '@/components/site/ui';
import { useTitle } from '@/components/site/hooks';
import { siteConfig } from '@/config/site';

export default function ContactPage() {
  useTitle('تماس با ما');
  const cleanPhone = siteConfig.phone.replace(/[^\d+]/g, '');

  return (
    <>
      <PageHead
        eyebrow="تماس و دسترسی"
        title="با ما در ارتباط باشید"
        lead="برای رزرو سریع‌تر از سیستم نوبت‌دهی آنلاین استفاده کنید؛ برای هر پرسش، مشاوره یا مراجعه حضوری، راه‌های ارتباطی زیر در دسترس شماست."
      />

      <section className="cl-wrap cl-section">
        {/* Main 6 Contact Cards Grid */}
        <div className="cl-contact-grid">
          {/* Card 1: Address */}
          <article className="cl-contact-card">
            <div className="cl-contact-card-head">
              <div className="cl-contact-card-title-wrap">
                <span className="cl-contact-card-icon" aria-hidden="true">
                  <MapPin className="w-5 h-5" />
                </span>
                <h2>نشانی کلینیک</h2>
              </div>
            </div>
            <div className="cl-contact-card-body">
              <address>
                <p className="font-semibold text-neutral-800 leading-relaxed">{siteConfig.address}</p>
              </address>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="cl-chip">پارکینگ اختصاصی</span>
                <span className="cl-chip">آسانسور اختصاصی</span>
              </div>
            </div>
            <div className="cl-contact-card-actions">
              <a
                className="cl-btn cl-btn-outline"
                href="#map-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Navigation className="w-4 h-4 ml-1.5" />
                مسیریابی در نقشه
              </a>
            </div>
          </article>

          {/* Card 2: Phone */}
          <article className="cl-contact-card">
            <div className="cl-contact-card-head">
              <div className="cl-contact-card-title-wrap">
                <span className="cl-contact-card-icon" aria-hidden="true">
                  <Phone className="w-5 h-5" />
                </span>
                <h2>تماس تلفنی</h2>
              </div>
              <span className="cl-chip">پاسخگویی مستقیم</span>
            </div>
            <div className="cl-contact-card-body">
              <p>
                <a
                  className="cl-contact-phone"
                  href={`tel:${cleanPhone}`}
                  dir="ltr"
                >
                  {siteConfig.phone}
                </a>
              </p>
              <p className="cl-muted cl-small">
                مشاوران پذیرش کلینیک در ساعات کاری پاسخگوی سؤالات شما هستند.
              </p>
            </div>
            <div className="cl-contact-card-actions">
              <a className="cl-btn cl-btn-outline" href={`tel:${cleanPhone}`}>
                <Phone className="w-4 h-4 ml-1.5" />
                تماس با پذیرش
              </a>
            </div>
          </article>

          {/* Card 3: Working Hours */}
          <article className="cl-contact-card">
            <div className="cl-contact-card-head">
              <div className="cl-contact-card-title-wrap">
                <span className="cl-contact-card-icon" aria-hidden="true">
                  <Clock className="w-5 h-5" />
                </span>
                <h2>ساعت کاری</h2>
              </div>
              <span className="cl-chip">پذیرش حضوری</span>
            </div>
            <div className="cl-contact-card-body">
              <ul className="cl-contact-hours">
                {siteConfig.hours.map(([d, h]) => {
                  const isClosed = h.includes('تعطیل');
                  return (
                    <li key={d} className={isClosed ? 'is-closed' : ''}>
                      <span className="cl-contact-hours-day">{d}</span>
                      <span className="cl-contact-hours-val">{h}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="cl-contact-card-actions">
              <Link className="cl-btn cl-btn-ghost cl-small" to="/book">
                نوبت‌دهی آنلاین ۲۴ ساعته فعال است ›
              </Link>
            </div>
          </article>

          {/* Card 4: Telegram Reminder */}
          <article className="cl-contact-card">
            <div className="cl-contact-card-head">
              <div className="cl-contact-card-title-wrap">
                <span className="cl-contact-card-icon cl-contact-card-icon-telegram" aria-hidden="true">
                  <Send className="w-5 h-5" />
                </span>
                <h2>یادآور تلگرام</h2>
              </div>
              <span className="cl-chip">هوشمند و رایگان</span>
            </div>
            <div className="cl-contact-card-body">
              <p className="cl-muted">
                ربات تلگرامی کلینیک ۲۴ ساعت و ۲ ساعت پیش از نوبت، اعلان یادآوری و نکات آمادگی را برایتان ارسال می‌کند.
              </p>
            </div>
            <div className="cl-contact-card-actions">
              <Link className="cl-btn cl-btn-outline" to="/telegram/subscribe">
                <Send className="w-4 h-4 ml-1.5" />
                اتصال به تلگرام
              </Link>
            </div>
          </article>

          {/* Card 5: Online Support */}
          <article className="cl-contact-card">
            <div className="cl-contact-card-head">
              <div className="cl-contact-card-title-wrap">
                <span className="cl-contact-card-icon" aria-hidden="true">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <h2>پشتیبانی آنلاین</h2>
              </div>
              <span className="cl-chip">پیگیری تیکت</span>
            </div>
            <div className="cl-contact-card-body">
              <p className="cl-muted">
                سؤال درمانی، پیگیری پرونده یا درخواست خود را ثبت کرده و پاسخ مشاوران را در سایت مشاهده فرمایید.
              </p>
            </div>
            <div className="cl-contact-card-actions">
              <Link className="cl-btn cl-btn-outline" to="/support/tickets">
                <MessageSquare className="w-4 h-4 ml-1.5" />
                درخواست‌های پشتیبانی
              </Link>
            </div>
          </article>

          {/* Card 6: Online Booking (Featured) */}
          <article className="cl-contact-card cl-contact-card-featured">
            <div className="cl-contact-card-head">
              <div className="cl-contact-card-title-wrap">
                <span className="cl-contact-card-icon" style={{ background: 'var(--cl-teal)', color: '#fff' }} aria-hidden="true">
                  <CalendarCheck className="w-5 h-5" />
                </span>
                <h2>رزرو آنلاین نوبت</h2>
              </div>
              <span className="cl-contact-badge-featured">سریع‌ترین روش ۲۴/۷</span>
            </div>
            <div className="cl-contact-card-body">
              <p className="font-semibold text-neutral-800">
                بدون انتظار پشت خط، زمان خالی متخصصان را ببینید و نوبت بگیرید.
              </p>
              <p className="cl-muted cl-small">
                انتخاب پزشک، خدمات تخصصی و تایید آنی با پیامک.
              </p>
            </div>
            <div className="cl-contact-card-actions">
              <Link className="cl-btn cl-btn-primary" to="/book">
                <Sparkles className="w-4 h-4 ml-1.5" />
                رزرو نوبت در سایت
              </Link>
            </div>
          </article>
        </div>

        {/* Location & Navigation Section */}
        <div id="map-section" className="cl-contact-location-section">
          <div className="cl-contact-location-card">
            <div className="cl-contact-map-preview">
              <div className="cl-contact-map-pin" aria-hidden="true">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-neutral-900 mb-1">موقعیت کلینیک نیلوفر در نقشه</h3>
                <p className="cl-muted cl-small max-w-sm">{siteConfig.address}</p>
              </div>
              <div className="cl-contact-map-actions">
                <a
                  className="cl-btn cl-btn-outline cl-btn-sm"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('تهران سعادت‌آباد خیابان سرو غربی پلاک ۱۸')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  گوگل مپ (Google Maps)
                </a>
                <a
                  className="cl-btn cl-btn-outline cl-btn-sm"
                  href={`https://neshan.org/maps/@35.778,51.373,15z`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  نشان (Neshan)
                </a>
                <a
                  className="cl-btn cl-btn-outline cl-btn-sm"
                  href={`https://balad.ir/search?query=${encodeURIComponent('سعادت‌آباد سرو غربی')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  بلد (Balad)
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-neutral-900 mb-2">راهنمای دسترسی به کلینیک</h3>
              <p className="cl-muted cl-small mb-4">
                برای راحتی مراجعان گرامی، بهترین مسیرهای دسترسی به شرح زیر است:
              </p>

              <ul className="cl-contact-access-list">
                <li className="cl-contact-access-item">
                  <span className="cl-contact-access-item-icon" aria-hidden="true">
                    <Train className="w-4 h-4" />
                  </span>
                  <div>
                    <strong className="block text-neutral-900 font-bold">مترو و اتوبوس</strong>
                    <span className="cl-muted cl-small">
                      ایستگاه متروی میدان کتاب (خط ۷) یا ایستگاه اتوبوس تندرو سرو غربی، ۵ دقیقه پیاده تا درب کلینیک.
                    </span>
                  </div>
                </li>
                <li className="cl-contact-access-item">
                  <span className="cl-contact-access-item-icon" aria-hidden="true">
                    <Car className="w-4 h-4" />
                  </span>
                  <div>
                    <strong className="block text-neutral-900 font-bold">خودرو شخصی و پارکینگ</strong>
                    <span className="cl-muted cl-small">
                      ورودی پارکینگ اختصاصی کلینیک از کوچهٔ مجاور پلاک ۱۸؛ هماهنگی پارکینگ در بدو ورود توسط نگهبان انجام می‌شود.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick FAQ / Guidance Strip */}
        <div className="mt-8 p-6 rounded-2xl bg-teal-50/70 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-teal-950 text-base mb-1">پرسشی درباره خدمات، تعرفه‌ها یا آمادگی پیش از درمان دارید؟</h4>
            <p className="text-sm text-teal-800/80 m-0">
              پیش از تماس تلفنی می‌توانید پاسخ رایج‌ترین پرسش‌های مراجعان را در بخش پرسش‌های متداول مطالعه فرمایید.
            </p>
          </div>
          <Link to="/faq" className="cl-btn cl-btn-outline whitespace-nowrap bg-white hover:bg-teal-50">
            مشاهده پرسش‌های متداول ›
          </Link>
        </div>
      </section>
    </>
  );
}
