import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Headphones,
  LogIn,
  RotateCcw,
  XCircle,
} from 'lucide-react';

/**
 * Loading Skeleton with matched dimensions to prevent layout shifts (CLS = 0).
 */
export function OrderLoadingSkeleton() {
  return (
    <section
      className="cl-order-skeleton-card"
      role="status"
      aria-live="polite"
      aria-label="در حال استعلام وضعیت پرداخت از بانک"
    >
      <div className="cl-order-skeleton-circle" aria-hidden="true" />
      <div
        className="cl-order-skeleton-bar"
        style={{ width: '60%', height: '24px' }}
        aria-hidden="true"
      />
      <div
        className="cl-order-skeleton-bar"
        style={{ width: '80%', height: '16px' }}
        aria-hidden="true"
      />
      <div
        className="cl-order-skeleton-bar"
        style={{ width: '40%', height: '16px' }}
        aria-hidden="true"
      />
      <p className="cl-muted cl-small" style={{ marginTop: '1rem' }}>
        در حال استعلام نهایی از درگاه بانکی، لطفاً شکیبا باشید…
      </p>
    </section>
  );
}

/**
 * Payment failure / cancellation state view.
 */
export function OrderFailureView({
  isCancelled,
  message,
  trackingAuthority,
  headingRef,
}) {
  return (
    <section
      className="cl-card cl-order-status-card cl-order-status-failure"
      role="alert"
      aria-live="assertive"
    >
      <div className="cl-order-icon-wrap" aria-hidden="true">
        <XCircle size={36} strokeWidth={2.4} />
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="cl-order-heading">
        {isCancelled ? 'پرداخت توسط کاربر لغو گردید' : 'پرداخت با موفقیت انجام نشد'}
      </h1>

      <p className="cl-order-subtext">
        {message ||
          (isCancelled
            ? 'عملیات پرداخت پیش از تکمیل لغو شد و هیچ مبلغی برای خرید این بسته ثبت نشد.'
            : 'درگاه بانکی تراکنش را تأیید نکرد و سفارشی برای این بسته ثبت نگردید.')}
      </p>

      {trackingAuthority ? (
        <p className="cl-small cl-muted" style={{ marginTop: '0.75rem' }}>
          شناسه پیگیری درگاه: <span style={{ direction: 'ltr', display: 'inline-block' }}>{trackingAuthority}</span>
        </p>
      ) : null}

      <div className="cl-actions" style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
        <Link to="/packages" className="cl-btn cl-btn-primary">
          <RotateCcw size={18} aria-hidden="true" />
          <span>تلاش مجدد برای خرید بسته</span>
        </Link>

        <Link to="/contact" className="cl-btn cl-btn-outline">
          <Headphones size={18} aria-hidden="true" />
          <span>تماس با پشتیبانی کلینیک</span>
        </Link>
      </div>
    </section>
  );
}

/**
 * Payment pending / under-process view with refresh button.
 */
export function OrderPendingView({ onRefresh, headingRef }) {
  return (
    <section
      className="cl-card cl-order-status-card cl-order-status-pending"
      role="status"
      aria-live="polite"
    >
      <div className="cl-order-icon-wrap" aria-hidden="true">
        <Clock size={36} strokeWidth={2.4} />
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="cl-order-heading">
        در حال بررسی وضعیت پرداخت
      </h1>

      <p className="cl-order-subtext">
        تأییدیه درگاه بانکی کمی بیش از معمول به طول انجامیده است. در صورتی که مبلغ از حسابتان کسر شده است، ظرف چند لحظه آینده وضعیت به صورت خودکار به‌روزرسانی خواهد شد.
      </p>

      <div className="cl-actions" style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
        <button
          type="button"
          className="cl-btn cl-btn-primary"
          onClick={onRefresh}
        >
          <RotateCcw size={18} aria-hidden="true" />
          <span>بررسی مجدد وضعیت</span>
        </button>

        <Link to="/packages" className="cl-btn cl-btn-outline">
          <span>بازگشت به بسته‌ها</span>
        </Link>
      </div>
    </section>
  );
}

/**
 * Invalid request or missing parameters view.
 */
export function OrderInvalidView({ headingRef }) {
  return (
    <section
      className="cl-card cl-order-status-card"
      role="alert"
      aria-live="polite"
    >
      <div className="cl-order-icon-wrap cl-order-icon-neutral" aria-hidden="true">
        <AlertTriangle size={34} strokeWidth={2.2} />
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="cl-order-heading"
        style={{ color: 'var(--cl-ink)' }}
      >
        اطلاعات سفارش یافت نشد
      </h1>

      <p className="cl-order-subtext">
        شناسه سفارش معتبری برای بررسی نتیجه پرداخت ارسال نشده است یا این سفارش در سامانه وجود ندارد.
      </p>

      <div className="cl-actions" style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
        <Link to="/packages" className="cl-btn cl-btn-primary">
          <span>مشاهدهٔ بسته‌های درمانی</span>
        </Link>

        <Link to="/" className="cl-btn cl-btn-outline">
          <span>صفحهٔ اصلی کلینیک</span>
        </Link>
      </div>
    </section>
  );
}

/**
 * Unauthorized / session expired view requiring login.
 */
export function OrderUnauthorizedView({ loginReturnUrl, headingRef }) {
  return (
    <section
      className="cl-card cl-order-status-card"
      role="alert"
      aria-live="polite"
    >
      <div className="cl-order-icon-wrap cl-order-icon-neutral" aria-hidden="true">
        <LogIn size={34} strokeWidth={2.2} />
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="cl-order-heading"
        style={{ color: 'var(--cl-ink)' }}
      >
        نیاز به ورود به حساب کاربری
      </h1>

      <p className="cl-order-subtext">
        برای مشاهدهٔ جزئیات این سفارش و فعال‌سازی بسته‌ها، لطفاً با شماره همراه خود وارد حساب کاربری شوید.
      </p>

      <div className="cl-actions" style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
        <Link
          to={`/auth/login?returnUrl=${encodeURIComponent(loginReturnUrl)}`}
          className="cl-btn cl-btn-primary"
        >
          <LogIn size={18} aria-hidden="true" />
          <span>ورود به حساب کاربری</span>
        </Link>

        <Link to="/packages" className="cl-btn cl-btn-outline">
          <span>بازگشت به بسته‌ها</span>
        </Link>
      </div>
    </section>
  );
}
