/**
 * Multi-step booking wizard shell — adapted from base44 `Booking.jsx`.
 * Renders progress, step content (children), and back/next. Parent owns state
 * or use `<BookingFlow>` for a wired default.
 */
import { Loader2 } from 'lucide-react';

const DEFAULT_STEP_LABELS = ['انتخاب زمان', 'اطلاعات'];

export function BookingWizard({
  stepLabels = DEFAULT_STEP_LABELS,
  currentStep = 0,
  /** When true, hides the progress bar (e.g. confirmation step). */
  hideProgress = false,
  canProceed = true,
  isSubmitting = false,
  onBack,
  onNext,
  nextLabel,
  confirmLabel = 'تأیید رزرو',
  backLabel = 'قبلی',
  title = 'رزرو نوبت',
  subtitle = 'در چند مرحله ساده نوبت خود را ثبت کنید',
  children,
}) {
  const isLastFormStep = currentStep === stepLabels.length - 1;
  return (
    <div className="section-padding min-h-[70vh] bg-surface">
      <div className="container-max max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="font-heading text-4xl font-light text-ink md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-muted">{subtitle}</p>
          ) : null}
        </div>

        {!hideProgress ? (
          <div className="mb-12 flex items-center justify-center gap-2 md:gap-4">
            {stepLabels.map((label, index) => (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2 md:gap-3">
                  <div
                    className={
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors duration-300 ' +
                      (index <= currentStep
                        ? 'bg-brand-500 text-on-brand-500'
                        : 'bg-subtle text-muted')
                    }
                  >
                    {index + 1}
                  </div>
                  <span
                    className={
                      'hidden text-sm md:block ' +
                      (index <= currentStep
                        ? 'text-ink'
                        : 'text-muted')
                    }
                  >
                    {label}
                  </span>
                </div>
                {index < stepLabels.length - 1 ? (
                  <div
                    className={
                      'mx-2 h-px w-8 md:w-16 ' +
                      (index < currentStep
                        ? 'bg-brand-500'
                        : 'bg-subtle')
                    }
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="mb-8">{children}</div>

        {!hideProgress ? (
          <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              disabled={currentStep === 0 || isSubmitting}
              className="cursor-pointer border border-input px-6 py-3 text-sm text-ink transition-colors duration-200 hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {backLabel}
            </button>
            <button
              type="button"
              data-testid="booking-confirm-button"
              onClick={onNext}
              disabled={!canProceed || isSubmitting}
              className="cursor-pointer bg-ink px-8 py-3 text-sm text-surface transition-colors duration-300 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ثبت…
                </span>
              ) : isLastFormStep ? (
                confirmLabel
              ) : (
                nextLabel ?? 'بعدی'
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default BookingWizard;
