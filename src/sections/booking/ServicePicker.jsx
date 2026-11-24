/**
 * Service / package picker — OPTIONAL cosmetic UI only.
 *
 * NOT part of the bookings plugin contract: there is no `service` entity and
 * `createBooking` has no service field. The default `<BookingFlow>` does not
 * include this step. Use it only as marketing/presentation UI (e.g. a services
 * showcase before the booking page) — never wire it to a booking API call.
 *
 * service shape: { id, title, description?, duration?, price?, icon? }
 * package shape: { id, name, description?, duration_minutes?, package_price?, regular_price?, services_included? }
 */
import { Check, Package as PackageIcon } from 'lucide-react';
import { useState } from 'react';

export function ServicePicker({
  services = [],
  packages = [],
  selected,
  onSelect,
  title = 'انتخاب خدمت',
  subtitle = 'یک خدمت تکی یا پکیج ویژه انتخاب کنید',
  servicesTabLabel = 'خدمات',
  packagesTabLabel = 'پکیج‌ها',
  emptyPackagesLabel = 'پکیجی در دسترس نیست',
}) {
  const [tab, setTab] = useState('services');
  const hasPackages = packages.length > 0;

  return (
    <div data-testid="service-list">
      <h2 className="font-heading mb-2 text-2xl font-light text-ink">
        {title}
      </h2>
      <p className="mb-8 text-muted">{subtitle}</p>

      {hasPackages ? (
        <div className="mx-auto mb-8 grid max-w-md grid-cols-2 gap-1 rounded-control bg-subtle p-1">
          <button
            type="button"
            onClick={() => setTab('services')}
            className={
              'cursor-pointer rounded-sm px-4 py-2 text-sm transition-colors ' +
              (tab === 'services'
                ? 'bg-card text-ink shadow-[var(--shadow-sm)]'
                : 'text-muted')
            }
          >
            {servicesTabLabel}
          </button>
          <button
            type="button"
            onClick={() => setTab('packages')}
            className={
              'cursor-pointer rounded-sm px-4 py-2 text-sm transition-colors ' +
              (tab === 'packages'
                ? 'bg-card text-ink shadow-[var(--shadow-sm)]'
                : 'text-muted')
            }
          >
            {packagesTabLabel}
            <span className="ms-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs text-on-brand-500">
              {packages.length}
            </span>
          </button>
        </div>
      ) : null}

      {tab === 'services' || !hasPackages ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const isSelected =
              selected?.id === service.id && !selected?.isPackage;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelect?.({ ...service, isPackage: false })}
                className={
                  'relative cursor-pointer border p-surface text-start transition-all duration-300 ' +
                  (isSelected
                    ? 'border-2 border-brand-500 bg-brand-50/20'
                    : 'border-border hover:border-brand-500/50')
                }
              >
                {isSelected ? (
                  <div className="absolute end-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500">
                    <Check className="h-4 w-4 text-on-brand-500" />
                  </div>
                ) : null}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-brand-500">
                  {service.icon ?? (
                    <span className="text-sm font-medium">
                      {(service.title ?? '?').slice(0, 1)}
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-lg font-medium text-ink">
                  {service.title}
                </h3>
                {service.description ? (
                  <p className="mb-4 text-sm text-muted">
                    {service.description}
                  </p>
                ) : null}
                <div className="flex items-center justify-between text-sm">
                  {service.duration != null ? (
                    <span className="text-muted">{service.duration} دقیقه</span>
                  ) : (
                    <span />
                  )}
                  {service.price != null ? (
                    <span className="font-medium text-brand-500">
                      {service.price.toLocaleString('fa-IR')}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted">
              <PackageIcon className="mx-auto mb-4 h-12 w-12 opacity-30" />
              {emptyPackagesLabel}
            </div>
          ) : (
            packages.map((pkg) => {
              const isSelected =
                selected?.id === pkg.id && selected?.isPackage;
              const savings =
                pkg.regular_price != null && pkg.package_price != null
                  ? pkg.regular_price - pkg.package_price
                  : 0;
              const savingsPercent =
                pkg.regular_price > 0
                  ? Math.round((savings / pkg.regular_price) * 100)
                  : 0;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() =>
                    onSelect?.({
                      id: pkg.id,
                      title: pkg.name ?? pkg.title,
                      description: pkg.description,
                      duration: pkg.duration_minutes ?? pkg.duration,
                      price: pkg.package_price ?? pkg.price,
                      isPackage: true,
                      servicesIncluded: pkg.services_included,
                    })
                  }
                  className={
                    'relative cursor-pointer border p-surface text-start transition-all duration-300 ' +
                    (isSelected
                      ? 'border-2 border-brand-500 bg-brand-50/20'
                      : 'border-border hover:border-brand-500/50')
                  }
                >
                  {isSelected ? (
                    <div className="absolute end-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500">
                      <Check className="h-4 w-4 text-on-brand-500" />
                    </div>
                  ) : savingsPercent > 0 ? (
                    <span className="absolute end-4 top-4 rounded-full bg-brand-500 px-2 py-0.5 text-xs text-on-brand-500">
                      {savingsPercent}٪ تخفیف
                    </span>
                  ) : null}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-brand-500">
                    <PackageIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-ink">
                    {pkg.name ?? pkg.title}
                  </h3>
                  {pkg.description ? (
                    <p className="mb-4 text-sm text-muted">
                      {pkg.description}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between text-sm">
                    {(pkg.duration_minutes ?? pkg.duration) != null ? (
                      <span className="text-muted">
                        {pkg.duration_minutes ?? pkg.duration} دقیقه
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="font-medium text-brand-500">
                      {(pkg.package_price ?? pkg.price)?.toLocaleString?.(
                        'fa-IR',
                      ) ?? pkg.package_price ?? pkg.price}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default ServicePicker;
