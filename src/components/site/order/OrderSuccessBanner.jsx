import { CheckCircle2 } from 'lucide-react';
import { fmtFullDate, fmtTime, money, nf } from '@/components/site/format';

/**
 * Success announcement banner with digital bank receipt table.
 * Adheres to WCAG AA role="status" and moves focus to the title heading.
 */
export default function OrderSuccessBanner({
  order,
  orderNumber,
  trackingAuthority,
  paidTimestamp,
  sandbox,
  headingRef,
}) {
  const primaryItem = Array.isArray(order?.items) ? order.items[0] : null;
  const totalPrice = order?.total || primaryItem?.lineTotal || 0;

  return (
    <section
      className="cl-card cl-order-status-card cl-order-status-success"
      role="status"
      aria-live="polite"
    >
      <div className="cl-order-icon-wrap" aria-hidden="true">
        <CheckCircle2 size={36} strokeWidth={2.4} />
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="cl-order-heading">
        ✓ پرداخت با موفقیت انجام شد
      </h1>

      <p className="cl-order-subtext">
        تراکنش بانکی شما با موفقیت تأیید شد و جلسات درمانی خریداری‌شده مستقیماً در حساب کاربری شما فعال گردید.
      </p>

      {/* Digital Bank Receipt */}
      <div className="cl-order-receipt">
        <div className="cl-order-receipt-grid">
          <div className="cl-order-receipt-item">
            <span className="cl-order-receipt-k">شماره سفارش:</span>
            <span className="cl-order-receipt-v">#{nf(orderNumber)}</span>
          </div>

          {trackingAuthority ? (
            <div className="cl-order-receipt-item">
              <span className="cl-order-receipt-k">کد رهگیری بانک:</span>
              <span className="cl-order-receipt-v">{trackingAuthority}</span>
            </div>
          ) : null}

          {paidTimestamp ? (
            <div className="cl-order-receipt-item">
              <span className="cl-order-receipt-k">تاریخ پرداخت:</span>
              <span className="cl-order-receipt-v cl-order-receipt-v-rtl">
                {fmtFullDate(paidTimestamp)}
              </span>
            </div>
          ) : null}

          {paidTimestamp ? (
            <div className="cl-order-receipt-item">
              <span className="cl-order-receipt-k">ساعت پرداخت:</span>
              <span className="cl-order-receipt-v">{fmtTime(paidTimestamp)}</span>
            </div>
          ) : null}

          <div className="cl-order-receipt-item">
            <span className="cl-order-receipt-k">مبلغ کل پرداختی:</span>
            <span className="cl-order-receipt-v cl-order-receipt-v-rtl cl-order-receipt-v-price">
              {money(totalPrice, order?.currency)}
            </span>
          </div>

          <div className="cl-order-receipt-item">
            <span className="cl-order-receipt-k">وضعیت تراکنش:</span>
            <span className="cl-order-receipt-v cl-order-receipt-v-rtl" style={{ color: '#166534' }}>
              موفق و تسویه‌شده {sandbox ? '(آزمایشی)' : ''}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
