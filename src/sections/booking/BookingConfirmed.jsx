/**
 * Booking confirmation summary — shows the reserved slot window plus the
 * `customerName` / `customerPhone` / `customerEmail` / `notes` that were submitted.
 */
import { CheckCircle, Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { formatSlotDate, formatSlotRange } from './slot-utils';

const CONFIRMED_DATE_FORMAT = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export function BookingConfirmed({
  slot,
  formData = {},
  locale = 'fa-IR',
  title = 'رزرو ثبت شد',
  subtitle = 'رزرو شما با موفقیت ثبت شد و در انتظار تأیید است',
  homeHref = '/',
  homeLabel = 'بازگشت به صفحه اصلی',
}) {
  return (
    <div data-testid="booking-confirmation">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/10">
          <CheckCircle className="h-10 w-10 text-brand-500" />
        </div>
        <h2 className="font-heading text-3xl font-light text-ink">
          {title}
        </h2>
        <p className="mt-2 text-muted">{subtitle}</p>
      </div>

      <div className="mx-auto max-w-2xl rounded-surface border border-border bg-card p-8">
        <h3 className="mb-6 text-xl font-medium text-ink">
          جزئیات رزرو
        </h3>
        <div className="space-y-4">
          <Row
            icon={<Calendar className="h-5 w-5" />}
            label="تاریخ"
            value={
              slot ? formatSlotDate(slot.startsAt, locale, CONFIRMED_DATE_FORMAT) : null
            }
          />
          <Row
            icon={<Clock className="h-5 w-5" />}
            label="بازه زمانی"
            value={slot ? formatSlotRange(slot, locale) : null}
          />
          <Row
            icon={<User className="h-5 w-5" />}
            label="نام"
            value={formData.customerName}
          />
          <Row
            icon={<Phone className="h-5 w-5" />}
            label="شماره تماس"
            value={formData.customerPhone}
          />
          <Row
            icon={<Mail className="h-5 w-5" />}
            label="ایمیل"
            value={formData.customerEmail}
          />
          <Row
            icon={<MessageSquare className="h-5 w-5" />}
            label="توضیحات"
            value={formData.notes}
          />
        </div>

        {formData.customerEmail ? (
          <div className="mt-8 rounded-control bg-subtle p-4 text-center text-sm text-muted">
            تأیید به{' '}
            <span className="font-medium text-ink" dir="ltr">
              {formData.customerEmail}
            </span>{' '}
            ارسال می‌شود.
          </div>
        ) : null}
      </div>

      {homeHref ? (
        <div className="mt-8 text-center">
          <a
            href={homeHref}
            className="inline-block cursor-pointer bg-ink px-8 py-3 text-sm text-surface transition-colors duration-300 hover:bg-brand-500"
          >
            {homeLabel}
          </a>
        </div>
      ) : null}
    </div>
  );
}

function Row({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 border-b border-border pb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-subtle text-brand-500">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

export default BookingConfirmed;
