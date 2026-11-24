/**
 * Site back-office SDK — bookings: staff scheduling, slot operations, calendar,
 * attendee management, credits, events, and Google Meet integration.
 *
 * For the site's owner, admins and team only; every call needs a staff capability
 * (`booking:manage`) and 403s for customers. Visitor and customer pages use
 * '@/api/plugins/bookings' instead. Installed and owned by the platform.
 */
import { pluginAction } from "./client.js";

/**
 * Confirm a pending booking. Provisions a Google Meet video conference link if
 * mode is google_meet.
 * @param {string} bookingId
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const confirmBooking = (bookingId) =>
  pluginAction(
    "bookings",
    `bookings/${encodeURIComponent(bookingId)}/confirm`,
    {
      method: "POST",
    },
  );

/**
 * Mark a booking as completed.
 * @param {string} bookingId
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const completeBooking = (bookingId) =>
  pluginAction(
    "bookings",
    `bookings/${encodeURIComponent(bookingId)}/complete`,
    {
      method: "POST",
    },
  );

/**
 * Record a customer no-show for a booking.
 * @param {string} bookingId
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const noShowBooking = (bookingId) =>
  pluginAction(
    "bookings",
    `bookings/${encodeURIComponent(bookingId)}/no-show`,
    {
      method: "POST",
    },
  );

/**
 * Check-in a customer for their booking.
 * @param {string} bookingId
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const checkInBooking = (bookingId) =>
  pluginAction(
    "bookings",
    `bookings/${encodeURIComponent(bookingId)}/check-in`,
    {
      method: "POST",
    },
  );

/**
 * Get details for a specific booking as a manager.
 * @param {string} bookingId
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const getBooking = (bookingId) =>
  pluginAction("bookings", `bookings/${encodeURIComponent(bookingId)}`);

/**
 * Cancel a booking as a manager.
 * @param {string} bookingId
 * @param {{reason?: string}=} body
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const cancelBooking = (bookingId, body = {}) =>
  pluginAction("bookings", `bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: "POST",
    body,
  });

/**
 * Reschedule an active booking to an alternate slot.
 * @param {string} bookingId
 * @param {{newSlotId: string, reason?: string}} body
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const rescheduleBooking = (bookingId, body) =>
  pluginAction(
    "bookings",
    `bookings/${encodeURIComponent(bookingId)}/reschedule`,
    {
      method: "POST",
      body,
    },
  );

/**
 * Check open availability across services, resources, and dates.
 * @param {Record<string, unknown>=} query
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const getAvailability = (query = {}) =>
  pluginAction("bookings", "availability", { query });

/**
 * Create a walk-in appointment immediately.
 * @param {{serviceId?: string, resourceId?: string, startsAt?: string, endsAt?: string, customerName: string, customerPhone?: string, notes?: string, price?: number}} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const createWalkIn = (input) =>
  pluginAction("bookings", "bookings", {
    method: "POST",
    body: input,
  });

/**
 * Create a single slot or an array of slots manually.
 * @param {{resource: string, service?: string, startsAt: string, endsAt: string, capacity?: number, price?: number, mode?: string, notes?: string} | Array<{resource: string, service?: string, startsAt: string, endsAt: string, capacity?: number, price?: number, mode?: string, notes?: string}>} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const createSlots = (input) =>
  pluginAction("bookings", "slots", {
    method: "POST",
    body: input,
  });

/**
 * Create recurring slots across a date range following weekly patterns.
 * @param {{serviceId?: string, resourceId: string, startDate: string, endDate: string, daysOfWeek: number[], startTime: string, endTime: string, slotDurationMinutes: number, bufferMinutes?: number, capacity?: number, price?: number, mode?: string}} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const createRecurringSlots = (input) =>
  pluginAction("bookings", "slots/recurring", {
    method: "POST",
    body: input,
  });

/**
 * Delete a single slot by ID.
 * @param {string} slotId
 * @param {{force?: boolean}=} options
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const deleteSlot = (slotId, options = {}) =>
  pluginAction("bookings", `slots/${encodeURIComponent(slotId)}`, {
    method: "DELETE",
    query: options.force ? { force: true } : undefined,
  });

/**
 * Bulk delete slots by ID list.
 * @param {string[]} slotIds
 * @param {{force?: boolean}=} options
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const bulkDeleteSlots = (slotIds, options = {}) =>
  pluginAction("bookings", "slots/bulk-delete", {
    method: "POST",
    body: { slotIds, force: Boolean(options.force) },
  });

/**
 * Delete slots across a date range matching specific criteria.
 * @param {{from: string, to: string, resourceId?: string, serviceId?: string, onlyEmpty?: boolean, force?: boolean}} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const deleteSlotsByRange = (input) =>
  pluginAction("bookings", "slots/delete-range", {
    method: "POST",
    body: input,
  });

/**
 * Generate slots idempotently from resource weekly schedules and policies.
 * @param {{daysAhead?: number, startDate?: string, endDate?: string, resourceId?: string}=} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const generateSlots = (input = {}) =>
  pluginAction("bookings", "slots/generate", {
    method: "POST",
    body: input,
  });

/**
 * Get the manager calendar view with slots, appointments, and resource allocations.
 * @param {{from?: string, to?: string, resourceId?: string, limit?: number, skip?: number}=} query
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const getCalendar = (query = {}) =>
  pluginAction("bookings", "calendar", { query });

/**
 * Grant a session package credit punch-card to a client.
 * @param {{clientId: string, totalSessions: number, serviceId?: string, eventId?: string, validityDays?: number, scheduleMode?: string, notes?: string}} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const grantCredit = (input) =>
  pluginAction("bookings", "credits", {
    method: "POST",
    body: input,
  });

/**
 * Manually consume/deduct a session from a client credit (for no_schedule mode).
 * @param {string} creditId
 * @param {{sessions?: number, notes?: string}=} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const consumeCredit = (creditId, input = {}) =>
  pluginAction("bookings", `credits/${encodeURIComponent(creditId)}/consume`, {
    method: "POST",
    body: input,
  });

/**
 * List credits and remaining punch-card balances for a specific client.
 * @param {string} clientId
 * @param {{limit?: number, skip?: number, sort?: string}=} query
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const listClientCredits = (clientId, query = {}) =>
  pluginAction("bookings", `clients/${encodeURIComponent(clientId)}/credits`, {
    query,
  });

/**
 * Create a new scheduled class or workshop event.
 * @param {{title: string, description?: string, place: string, price?: number, currency?: string, capacity?: number, startsAt: string, endsAt: string, recurrence?: Record<string, unknown>, image?: string, mode?: string, package?: Record<string, unknown>}} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const createEvent = (input) =>
  pluginAction("bookings", "events", {
    method: "POST",
    body: input,
  });

/**
 * Update an existing event.
 * @param {string} eventId
 * @param {Record<string, unknown>} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const updateEvent = (eventId, input) =>
  pluginAction("bookings", `events/${encodeURIComponent(eventId)}`, {
    method: "PUT",
    body: input,
  });

/**
 * Cancel an event or its entire recurring series.
 * @param {string} eventId
 * @param {{reason?: string, cancelSeries?: boolean}=} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const cancelEvent = (eventId, input = {}) =>
  pluginAction("bookings", `events/${encodeURIComponent(eventId)}/cancel`, {
    method: "POST",
    body: input,
  });

/**
 * List registered attendees for an event.
 * @param {string} eventId
 * @param {{limit?: number, skip?: number}=} query
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const listEventRegistrations = (eventId, query = {}) =>
  pluginAction(
    "bookings",
    `events/${encodeURIComponent(eventId)}/registrations`,
    { query },
  );

/**
 * Get Google OAuth authorization start URL for Google Calendar & Meet integration.
 * @returns {Promise<{url: string}>}
 */
export const getGoogleOAuthStartUrl = () =>
  pluginAction("bookings", "google/oauth/start");

/**
 * Exchange Google OAuth authorization code to complete integration setup.
 * @param {string} code
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const handleGoogleOAuthCallback = (code) =>
  pluginAction("bookings", "google/oauth/callback", {
    method: "POST",
    body: { code },
  });

/**
 * Check Google Meet / Calendar integration status.
 * @returns {Promise<{connected: boolean, email?: string}>}
 */
export const getGoogleStatus = () => pluginAction("bookings", "google/status");

/**
 * Disconnect Google Meet / Calendar integration.
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const disconnectGoogle = () =>
  pluginAction("bookings", "google/disconnect", {
    method: "POST",
  });

/**
 * Get Google OAuth authorization start URL for a staff member.
 * @param {string} resourceId
 * @param {{redirectUri?: string}=} query
 * @returns {Promise<{url: string}>}
 */
export const getStaffGoogleOAuthStartUrl = (resourceId, query = {}) =>
  pluginAction(
    "bookings",
    `resources/${encodeURIComponent(resourceId)}/google/oauth/start`,
    { query },
  );

/**
 * Exchange Google OAuth authorization code to link staff Google account.
 * @param {string} resourceId
 * @param {{code: string, redirectUri?: string, state?: string}} body
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const handleStaffGoogleOAuthCallback = (resourceId, body) =>
  pluginAction(
    "bookings",
    `resources/${encodeURIComponent(resourceId)}/google/oauth/callback`,
    {
      method: "POST",
      body,
    },
  );

/**
 * Check Google Calendar integration status for a staff member.
 * @param {string} resourceId
 * @returns {Promise<{connected: boolean, email?: string, selectedCalendarId?: string, lastSyncedAt?: string, lastError?: string}>}
 */
export const getStaffGoogleStatus = (resourceId) =>
  pluginAction(
    "bookings",
    `resources/${encodeURIComponent(resourceId)}/google/status`,
  );

/**
 * Disconnect Google Calendar integration for a staff member.
 * @param {string} resourceId
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const disconnectStaffGoogle = (resourceId) =>
  pluginAction(
    "bookings",
    `resources/${encodeURIComponent(resourceId)}/google/disconnect`,
    {
      method: "POST",
    },
  );

/**
 * List Google Calendars accessible by a staff member.
 * @param {string} resourceId
 * @returns {Promise<{calendars: Array<{id: string, summary: string, primary?: boolean, timeZone?: string}>}>}
 */
export const getStaffGoogleCalendars = (resourceId) =>
  pluginAction(
    "bookings",
    `resources/${encodeURIComponent(resourceId)}/google/calendars`,
  );

/**
 * Set selected Google Calendar for a staff member.
 * @param {string} resourceId
 * @param {{calendarId: string}} body
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const setStaffGoogleCalendar = (resourceId, body) =>
  pluginAction(
    "bookings",
    `resources/${encodeURIComponent(resourceId)}/google/calendar`,
    {
      method: "PUT",
      body,
    },
  );

/**
 * Create a new saved location.
 * @param {{name: string, address: string, description?: string}} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const createSavedLocation = (input) =>
  pluginAction("bookings", "locations", {
    method: "POST",
    body: input,
  });

/**
 * List saved locations with optional search and pagination.
 * @param {{search?: string, limit?: number, offset?: number, skip?: number}=} query
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const listSavedLocations = (query = {}) =>
  pluginAction("bookings", "locations", { query });

/**
 * Get a saved location by ID.
 * @param {string} locationId
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const getSavedLocation = (locationId) =>
  pluginAction("bookings", `locations/${encodeURIComponent(locationId)}`);

/**
 * Update an existing saved location.
 * @param {string} locationId
 * @param {{name?: string, address?: string, description?: string}} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const updateSavedLocation = (locationId, input) =>
  pluginAction("bookings", `locations/${encodeURIComponent(locationId)}`, {
    method: "PATCH",
    body: input,
  });

/**
 * Delete a saved location.
 * @param {string} locationId
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const deleteSavedLocation = (locationId) =>
  pluginAction("bookings", `locations/${encodeURIComponent(locationId)}`, {
    method: "DELETE",
  });

/**
 * Create a new bookable service.
 * @param {Record<string, unknown>} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const createService = (input) =>
  pluginAction("bookings", "services", {
    method: "POST",
    body: input,
  });

/**
 * Update an existing bookable service.
 * @param {string} serviceId
 * @param {Record<string, unknown>} input
 * @returns {Promise<import('./client.js').ApiResult>}
 */
export const updateService = (serviceId, input) =>
  pluginAction("bookings", `services/${encodeURIComponent(serviceId)}`, {
    method: "PUT",
    body: input,
  });
