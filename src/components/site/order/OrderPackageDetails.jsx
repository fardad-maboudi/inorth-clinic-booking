import { Calendar, Layers, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { money, nf } from '@/components/site/format';

/**
 * Detailed specification card for the purchased clinical package.
 */
export default function OrderPackageDetails({ order, user }) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const primaryItem = items[0] || null;

  const packageSessions =
    primaryItem?.attributes?.sessions ??
    primaryItem?.attributes?.sessionCount ??
    primaryItem?.title?.match(/(\d+)\s*جلسه/)?.[1] ??
    null;

  const packageValidityDays =
    primaryItem?.attributes?.validityDays ??
    primaryItem?.attributes?.validity ??
    primaryItem?.title?.match(/(\d+)\s*روز/)?.[1] ??
    null;

  const customerName = order?.customer?.name || user?.name || 'مشتری گرامی';
  const customerPhone = order?.customer?.phone || user?.phoneNumber || '';

  return (
    <section className="cl-card cl-order-package-card">
      <div className="cl-order-card-header">
        <h2 className="cl-order-card-title">
          <Sparkles size={22} aria-hidden="true" />
          <span>مشخصات بستهٔ خریداری‌شده</span>
        </h2>
        <span className="cl-order-active-badge">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>فعال در حساب کاربری</span>
        </span>
      </div>

      <div className="cl-order-item-hero">
        <h3 className="cl-order-item-name">
          {primaryItem?.title || 'بسته جلسات درمانی کلینیک نیلوفر'}
        </h3>
        <div className="cl-order-item-price">
          {money(primaryItem?.lineTotal || order?.total || 0, order?.currency)}
        </div>
      </div>

      {/* Key specs chips */}
      <div className="cl-order-specs-row" role="list" aria-label="مشخصات و شرایط بسته">
        {packageSessions ? (
          <div className="cl-order-spec-badge" role="listitem">
            <Layers size={18} aria-hidden="true" />
            <span>{nf(packageSessions)} جلسه درمانی تخصصی</span>
          </div>
        ) : null}

        {packageValidityDays ? (
          <div className="cl-order-spec-badge" role="listitem">
            <Calendar size={18} aria-hidden="true" />
            <span>{nf(packageValidityDays)} روز مهلت استفاده</span>
          </div>
        ) : (
          <div className="cl-order-spec-badge" role="listitem">
            <Calendar size={18} aria-hidden="true" />
            <span>اعتبار بلندمدت بدون انقضای فوری</span>
          </div>
        )}

        <div className="cl-order-spec-badge" role="listitem">
          <UserCheck size={18} aria-hidden="true" />
          <span>امکان انتخاب آزادانهٔ روز و متخصص</span>
        </div>
      </div>

      {/* Buyer Information */}
      {(order?.customer?.name || order?.customer?.phone || user) && (
        <div className="cl-order-customer-box">
          <div className="cl-order-customer-field">
            <span className="cl-order-customer-label">تحویل‌گیرنده / خریدار:</span>
            <span className="cl-order-customer-val">{customerName}</span>
          </div>
          <div className="cl-order-customer-field">
            <span className="cl-order-customer-label">شماره همراه متصل به اعتبار:</span>
            <span className="cl-order-customer-val" style={{ direction: 'ltr', textAlign: 'start' }}>
              {customerPhone ? nf(customerPhone) : '—'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
