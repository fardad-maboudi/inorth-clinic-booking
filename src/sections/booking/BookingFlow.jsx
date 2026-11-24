/**
 * Drop-in booking flow wired to the bookings plugin contract.
 *
 * Two steps + confirmation: pick a slot → contact details → done. Availability
 * is real `slot` rows (no invented time grid) and the submit body is exactly
 * what `createBooking` expects.
 *
 * Inject the API from the page so apps without the plugin still build:
 *
 *   import { listSlots, bookSlot } from '@/api/plugins/bookings';
 *   <BookingFlow listSlots={listSlots} createBooking={bookSlot} />
 *
 * Auth: slots are public, but CREATING a booking requires a logged-in end
 * user — an anonymous `bookSlot` call fails with 401. Pass
 * `onAuthRequired` to open your login flow (e.g. the auth plugin's OTP form);
 * the flow also shows an inline "login required" message.
 */
import { useEffect, useState } from 'react';
import { BookingWizard } from './BookingWizard';
import { SlotPicker } from './SlotPicker';
import { slotId } from './slot-utils';
import { BookingDetailsForm } from './BookingDetailsForm';
import { BookingConfirmed } from './BookingConfirmed';

const STEPS = ['slot', 'details', 'done'];

export function BookingFlow({
  /** async (params) => slot[] — pass `listSlots` from '@/api/plugins/bookings' */
  listSlots,
  /** async (body) => booking — pass `bookSlot` from '@/api/plugins/bookings' */
  createBooking,
  /** Called when booking creation fails with 401 (guest) — open login/OTP UI. */
  onAuthRequired,
  /** Optional hook after a successful booking, receives the created row. */
  onBooked,
  /** Optional pre-seed for the notes field (e.g. chosen service). */
  initialNotes,
  homeHref = '/',
  title = 'رزرو نوبت',
  subtitle = 'در دو مرحله ساده نوبت خود را ثبت کنید',
  stepLabels = ['انتخاب زمان', 'اطلاعات'],
  loginRequiredMessage = 'برای ثبت رزرو ابتدا وارد حساب کاربری شوید.',
  genericErrorMessage = 'ثبت رزرو ناموفق بود. دوباره تلاش کنید.',
}) {
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(Boolean(listSlots));
  const [prevListSlots, setPrevListSlots] = useState(listSlots);
  if (listSlots !== prevListSlots) {
    setPrevListSlots(listSlots);
    setLoadingSlots(Boolean(listSlots));
  }
  const [slot, setSlot] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: initialNotes ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!listSlots) return undefined;
    let cancelled = false;

    Promise.resolve(listSlots({ filter: { available: true }, sort: 'startsAt' }))
      .then((rows) => {
        if (!cancelled) setSlots(Array.isArray(rows) ? rows : (rows?.items ?? []));
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listSlots]);

  const canProceed = () => {
    switch (STEPS[step]) {
      case 'slot':
        return slot != null;
      case 'details':
        return Boolean(formData.customerName.trim());
      default:
        return true;
    }
  };

  const submit = async () => {
    setError(null);
    if (!createBooking) {
      setStep(2);
      return;
    }
    setSubmitting(true);
    try {
      // Exact `booking` entity shape — optional fields omitted when empty.
      const body = {
        slotId: slotId(slot),
        customerName: formData.customerName.trim(),
        startsAt: slot.startsAt,
        status: 'pending',
      };
      if (formData.customerPhone?.trim()) {
        body.customerPhone = formData.customerPhone.trim();
      }
      if (formData.customerEmail?.trim()) {
        body.customerEmail = formData.customerEmail.trim();
      }
      if (formData.notes?.trim()) body.notes = formData.notes.trim();

      const booking = await createBooking(body);
      onBooked?.(booking);
      setStep(2);
    } catch (err) {
      if (err?.status === 401) {
        setError(loginRequiredMessage);
        onAuthRequired?.();
      } else {
        setError(err?.message || genericErrorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (STEPS[step] === 'details') {
      void submit();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const done = STEPS[step] === 'done';

  return (
    <BookingWizard
      stepLabels={stepLabels}
      currentStep={Math.min(step, stepLabels.length - 1)}
      hideProgress={done}
      canProceed={canProceed()}
      isSubmitting={submitting}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={handleNext}
      title={title}
      subtitle={subtitle}
    >
      {STEPS[step] === 'slot' ? (
        <SlotPicker
          slots={slots}
          loading={loadingSlots}
          selectedSlot={slot}
          onSelect={setSlot}
        />
      ) : null}
      {STEPS[step] === 'details' ? (
        <BookingDetailsForm formData={formData} onChange={setFormData} />
      ) : null}
      {done ? (
        <BookingConfirmed slot={slot} formData={formData} homeHref={homeHref} />
      ) : null}
      {error && !done ? (
        <p role="alert" className="mx-auto mt-6 max-w-2xl text-center text-sm text-state-error-ink">
          {error}
        </p>
      ) : null}
    </BookingWizard>
  );
}

export default BookingFlow;
