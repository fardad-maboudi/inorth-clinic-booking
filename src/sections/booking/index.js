/**
 * Booking / scheduling sections — wired to the bookings plugin contract
 * (`slot` + `booking` entities via '@/api/plugins/bookings').
 *
 * Prefer `<BookingFlow>` for a full page and inject the API from the page:
 *
 *   import { listSlots, bookSlot } from '@/api/plugins/bookings';
 *   <BookingFlow listSlots={listSlots} createBooking={bookSlot} />
 *
 * Guests can see slots; creating a booking needs a logged-in end user (pair
 * with the auth plugin's OTP login, or the create call fails with 401).
 * `ServicePicker` is optional cosmetic UI only — no service entity exists.
 */
export { BookingWizard } from './BookingWizard';
export { ServicePicker } from './ServicePicker';
export { SlotPicker } from './SlotPicker';
export { slotId, formatSlotRange, formatSlotDate, slotDateKey } from './slot-utils';
export { BookingDetailsForm } from './BookingDetailsForm';
export { BookingConfirmed } from './BookingConfirmed';
export { BookingFlow } from './BookingFlow';
