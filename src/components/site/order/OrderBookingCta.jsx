import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';

/**
 * Suggestion card recommending the patient start their booking process.
 */
export default function OrderBookingCta() {
  return (
    <section className="cl-order-cta-card">
      <div className="cl-order-cta-head">
        <div className="cl-order-cta-icon" aria-hidden="true">
          <Calendar size={26} />
        </div>
        <div className="cl-order-cta-text">
          <h3>آماده‌اید درمان خود را شروع کنید؟</h3>
          <p>
            جلسات بسته در حسابتان منظور شده است. هر زمان تمایل داشتید می‌توانید با انتخاب روز، ساعت و متخصص دلخواه، اولین نوبت حضوری خود را تنظیم کنید.
          </p>
        </div>
      </div>

      <div className="cl-order-cta-actions">
        <Link to="/book" className="cl-btn cl-btn-primary cl-btn-lg">
          <span>شروع رزرو نوبت حضوری</span>
          <ArrowRight size={18} aria-hidden="true" style={{ transform: 'rotate(180deg)' }} />
        </Link>

        <Link to="/client?tab=credits" className="cl-btn cl-btn-outline">
          <span>مشاهده اعتبار و بسته‌ها در «حساب من»</span>
        </Link>
      </div>
    </section>
  );
}
