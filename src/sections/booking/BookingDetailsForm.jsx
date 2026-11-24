/**
 * Booking contact details — fields match the bookings plugin `booking` entity:
 * `customerName` (required), `customerPhone` (optional/recommended for SMS),
 * `customerEmail` (optional), `notes` (optional).
 * Controlled: pass `formData` + `onChange`.
 */
import { User, Phone, Mail, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function BookingDetailsForm({
  formData = {},
  onChange,
  title = 'اطلاعات شما',
  subtitle = 'برای ثبت رزرو، اطلاعات تماس خود را وارد کنید',
}) {
  const update = (patch) => onChange?.({ ...formData, ...patch });

  return (
    <div className="space-y-8" data-testid="booking-details-form">
      <div>
        <h2 className="font-heading mb-2 text-2xl font-light text-ink">
          {title}
        </h2>
        <p className="text-muted">{subtitle}</p>
      </div>

      <div className="space-y-6 rounded-surface border border-border bg-card p-8">
        <div>
          <Label
            htmlFor="booking-customer-name"
            className="mb-2 flex items-center gap-2 text-ink"
          >
            <User className="h-4 w-4 text-brand-500" />
            نام و نام خانوادگی *
          </Label>
          <Input
            id="booking-customer-name"
            value={formData.customerName ?? ''}
            onChange={(e) => update({ customerName: e.target.value })}
            placeholder="نام کامل"
            required
            className="border-input focus-visible:ring-brand-500"
          />
        </div>

        <div>
          <Label
            htmlFor="booking-customer-phone"
            className="mb-2 flex items-center gap-2 text-ink"
          >
            <Phone className="h-4 w-4 text-brand-500" />
            شماره موبایل
          </Label>
          <Input
            id="booking-customer-phone"
            type="tel"
            value={formData.customerPhone ?? ''}
            onChange={(e) => update({ customerPhone: e.target.value })}
            placeholder="۰۹۱۲۰۰۰۰۰۰۰"
            className="border-input focus-visible:ring-brand-500"
            dir="ltr"
          />
        </div>

        <div>
          <Label
            htmlFor="booking-customer-email"
            className="mb-2 flex items-center gap-2 text-ink"
          >
            <Mail className="h-4 w-4 text-brand-500" />
            ایمیل (اختیاری)
          </Label>
          <Input
            id="booking-customer-email"
            type="email"
            value={formData.customerEmail ?? ''}
            onChange={(e) => update({ customerEmail: e.target.value })}
            placeholder="ایمیل"
            className="border-input focus-visible:ring-brand-500"
            dir="ltr"
          />
        </div>

        <div>
          <Label
            htmlFor="booking-notes"
            className="mb-2 flex items-center gap-2 text-ink"
          >
            <MessageSquare className="h-4 w-4 text-brand-500" />
            توضیحات (اختیاری)
          </Label>
          <Textarea
            id="booking-notes"
            value={formData.notes ?? ''}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="درخواست ویژه یا یادداشت برای رزرو…"
            className="h-24 resize-none border-input focus-visible:ring-brand-500"
          />
        </div>
      </div>
    </div>
  );
}

export default BookingDetailsForm;
