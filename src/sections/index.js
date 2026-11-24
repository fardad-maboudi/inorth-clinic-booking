/**
 * Booking / scheduling public API for the bookings plugin.
 *
 * Landing section starters (HeroCentered, HeroSplit, FeatureBento, etc.) were
 * removed because 0 page imports shipped them as dead modules on every app
 * (see todos/Agent Scaffold Context Problem.md). Booking remains: the bookings
 * plugin contract tells the agent to `import { BookingFlow } from '@/sections'`.
 *
 * Prefer `<BookingFlow>` for a full page and inject the API from the page:
 *   import { listSlots, createBooking } from '@/api/plugins/bookings';
 *   import { BookingFlow } from '@/sections';
 *
 * Or compose BookingWizard + SlotPicker + BookingDetailsForm + BookingConfirmed.
 * ServicePicker is cosmetic only.
 */
export {
  BookingFlow,
  BookingWizard,
  ServicePicker,
  SlotPicker,
  slotId,
  formatSlotRange,
  formatSlotDate,
  slotDateKey,
  BookingDetailsForm,
  BookingConfirmed,
} from './booking';
