import { Link } from 'react-router-dom';
import {
  buttonClass,
  inputClass,
  panelClass,
  priceLabel,
  formatDate,
  formatTime,
} from './bookingUtils';

export function BookingShell({ title, description, children }) {
  return (
    <main dir="rtl" className="mx-auto max-w-6xl space-y-8 px-4 py-8 text-foreground sm:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </div>
        <nav aria-label="رزروها" className="flex flex-wrap gap-2">
          <Link className={buttonClass} to="/bookings/book">
            رزرو نوبت
          </Link>
          <Link className={buttonClass} to="/bookings/events">
            رویدادها
          </Link>
          <Link className={buttonClass} to="/bookings/my-bookings">
            رزروهای من
          </Link>
        </nav>
      </header>
      {children}
    </main>
  );
}

export function QueryFeedback({ query, empty, children }) {
  if (query.isLoading)
    return (
      <p role="status" className="animate-pulse rounded-xl bg-subtle p-6">
        در حال دریافت اطلاعات…
      </p>
    );
  if (query.isError)
    return (
      <div role="alert" className="space-y-3 rounded-xl border border-border p-5">
        <p>{query.error?.message || 'دریافت اطلاعات انجام نشد'}</p>
        <button className={buttonClass} onClick={() => void query.refetch()}>
          تلاش دوباره
        </button>
      </div>
    );
  return empty ? (
    <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      {empty}
    </p>
  ) : (
    children
  );
}

export function GuestFields({ value, onChange, seats = false, maxSeats = 1 }) {
  const field = (name) => ({
    value: value[name] || '',
    onChange: (event) => onChange({ ...value, [name]: event.target.value }),
  });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm">
        <span>نام و نام خانوادگی</span>
        <input
          className={inputClass}
          autoComplete="name"
          required
          maxLength={200}
          {...field('customerName')}
        />
      </label>
      <label className="space-y-2 text-sm">
        <span>شماره موبایل</span>
        <input
          className={inputClass}
          type="tel"
          dir="ltr"
          autoComplete="tel"
          required
          maxLength={30}
          {...field('customerPhone')}
        />
      </label>
      <label className="space-y-2 text-sm">
        <span>ایمیل (اختیاری)</span>
        <input
          className={inputClass}
          type="email"
          dir="ltr"
          autoComplete="email"
          {...field('customerEmail')}
        />
      </label>
      {seats && (
        <label className="space-y-2 text-sm">
          <span>تعداد نفرات</span>
          <input
            className={inputClass}
            type="number"
            min={1}
            max={maxSeats}
            required
            {...field('seats')}
          />
        </label>
      )}
      <label className="space-y-2 text-sm sm:col-span-2">
        <span>یادداشت (اختیاری)</span>
        <textarea className={inputClass} maxLength={2000} rows={3} {...field('notes')} />
      </label>
    </div>
  );
}

export function Summary({ service, slot, children }) {
  return (
    <aside className={panelClass + ' space-y-5 self-start lg:sticky lg:top-6'}>
      <span className="text-xs font-medium text-muted-foreground">خلاصه رزرو</span>
      <h2 className="text-xl font-bold">{service?.name || service?.title || 'نوبت شما'}</h2>
      {service?.description && (
        <p className="text-sm leading-7 text-muted-foreground">{service.description}</p>
      )}
      <dl className="space-y-4 text-sm">
        {service?.durationMinutes && (
          <div className="flex justify-between gap-3">
            <dt>مدت جلسه</dt>
            <dd>{Number(service.durationMinutes).toLocaleString('fa-IR')} دقیقه</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt>هزینه</dt>
          <dd>{priceLabel(slot?.price ?? service?.price)}</dd>
        </div>
        {slot && (
          <>
            <div>
              <dt className="text-muted-foreground">تاریخ</dt>
              <dd className="mt-1 font-medium">{formatDate(slot.startsAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">ساعت (تهران)</dt>
              <dd className="mt-1">
                {formatTime(slot.startsAt)} تا {formatTime(slot.endsAt)}
              </dd>
            </div>
          </>
        )}
      </dl>
      {children}
    </aside>
  );
}
