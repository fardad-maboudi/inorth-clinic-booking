import {
  listPluginRecords,
  getPluginRecord,
  requestPluginAction,
} from "@/api/joorchin";

function bookingSession() {
  let id = localStorage.getItem("joorchin-booking-session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("joorchin-booking-session", id);
  }
  return id;
}

function bookingAction(action, data, method = "POST") {
  return requestPluginAction("bookings", action, {
    method,
    data,
    headers: { "x-booking-session": bookingSession() },
  });
}

/**
 * List bookable availability with remaining seats. Filters travel as query
 * params — an action string containing '?' is path-encoded to '%3F' and 404s.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 * @param {{from?: string, to?: string, resourceId?: string, serviceId?: string}} [filters]
 */
export function listAvailability({ from, to, resourceId, serviceId } = {}) {
  return requestPluginAction("bookings", "availability", {
    method: "GET",
    query: { from, to, resourceId, serviceId },
    headers: { "x-booking-session": bookingSession() },
  }).then((res) => res.slots || []);
}

/**
 * Slot rows for the BookingFlow listSlots prop. The server already
 * returns only bookable future slots, so BookingFlow's own filter argument is
 * ignored; pass { from, to, resourceId, serviceId } to narrow.
 * @param {Record<string,unknown>=} query
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listSlots(query = {}) {
  const { from, to, resourceId, serviceId } = query || {};
  return listAvailability({ from, to, resourceId, serviceId });
}

/**
 * Get details for a specific slot.
 * @param {string} slotId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getSlot(slotId) {
  return getPluginRecord("bookings", "slot", slotId);
}

/**
 * Reserve seats of a slot through the atomic server route.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 * @param {{slotId: string, customerName: string, customerPhone: string, customerEmail?: string, seats?: number, notes?: string, intake?: Record<string, unknown>, creditId?: string}} input
 * @example
 * const slots = await listSlots({ serviceId, from: '2026-10-10', to: '2026-10-17' });
 * const booking = await bookSlot({ slotId: slots[0]._id, customerName: 'سارا', customerPhone: '09121234567' });
 */
export function bookSlot({
  slotId,
  customerName,
  customerPhone,
  customerEmail,
  seats = 1,
  notes,
  intake,
  creditId,
}) {
  return requestPluginAction(
    "bookings",
    "slots/" + encodeURIComponent(slotId) + "/book",
    {
      method: "POST",
      data: {
        customerName,
        customerPhone,
        customerEmail,
        seats,
        notes,
        intake,
        creditId,
      },
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/** Alias for bookSlot used by template and section consumers. */
export const createBooking = bookSlot;

/**
 * Cancel an owned reservation and restore its seats.
 * @param {string} bookingId
 * @param {string} [reason]
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function cancelMyBooking(bookingId, reason) {
  return requestPluginAction(
    "bookings",
    "bookings/" + encodeURIComponent(bookingId) + "/cancel",
    {
      method: "POST",
      data: { reason },
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * Reschedule a booking to a new slot.
 * @param {string} bookingId
 * @param {string} newSlotId
 * @param {string} reason
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function rescheduleBooking(bookingId, newSlotId, reason) {
  return requestPluginAction(
    "bookings",
    "bookings/" + encodeURIComponent(bookingId) + "/reschedule",
    {
      method: "POST",
      data: { newSlotId, reason },
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * List the current user or session's bookings.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listMyBookings() {
  return requestPluginAction("bookings", "my", {
    method: "GET",
    headers: { "x-booking-session": bookingSession() },
  }).then((res) => res.items || []);
}

/** Alias for listMyBookings. */
export const listBookings = listMyBookings;

/**
 * Get details for a specific booking.
 * @param {string} bookingId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getBooking(bookingId) {
  return requestPluginAction(
    "bookings",
    "bookings/" + encodeURIComponent(bookingId),
    {
      method: "GET",
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * List active bookable services.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listServices() {
  return listPluginRecords("bookings", "booking_service", {
    filter: { active: true },
    sort: "sortOrder",
  });
}

/**
 * List active staff members / resources.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listResources() {
  return listPluginRecords("bookings", "booking_resource", {
    filter: { active: true },
  });
}

/**
 * List the current client's session package credits.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function myCredits() {
  return requestPluginAction("bookings", "credits/my", {
    method: "GET",
    headers: { "x-booking-session": bookingSession() },
  }).then((res) => res.items || []);
}

/**
 * List upcoming scheduled events.
 * @param {{from?: string, to?: string, status?: string, includePast?: boolean, limit?: number, skip?: number}=} query
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listEvents(query = {}) {
  const { from, to, status, includePast, limit, skip } = query || {};
  return requestPluginAction("bookings", "events", {
    method: "GET",
    query: { from, to, status, includePast, limit, skip },
    headers: { "x-booking-session": bookingSession() },
  }).then((res) => res.items || []);
}

/**
 * Get details for a specific event.
 * @param {string} eventId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getEvent(eventId) {
  return requestPluginAction(
    "bookings",
    "events/" + encodeURIComponent(eventId),
    {
      method: "GET",
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * Register seats for a scheduled event.
 * @param {{eventId: string, customerName: string, customerPhone: string, customerEmail?: string, seats?: number, notes?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function bookEvent({
  eventId,
  customerName,
  customerPhone,
  customerEmail,
  seats = 1,
  notes,
}) {
  return requestPluginAction(
    "bookings",
    "events/" + encodeURIComponent(eventId) + "/book",
    {
      method: "POST",
      data: { customerName, customerPhone, customerEmail, seats, notes },
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * Cancel an event registration and restore seats.
 * @param {string} registrationId
 * @param {string} [reason]
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function cancelMyEventRegistration(registrationId, reason) {
  return requestPluginAction(
    "bookings",
    "events/registrations/" + encodeURIComponent(registrationId) + "/cancel",
    {
      method: "POST",
      data: { reason },
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * List the current user or session's event registrations.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listMyEvents() {
  return requestPluginAction("bookings", "events/my", {
    method: "GET",
    headers: { "x-booking-session": bookingSession() },
  }).then((res) => res.items || []);
}

/**
 * List bookings for a specific slot (session/user scoped for visitors).
 * @param {string} slotId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listSlotBookings(slotId) {
  return requestPluginAction(
    "bookings",
    "slots/" + encodeURIComponent(slotId) + "/bookings",
    {
      method: "GET",
      headers: { "x-booking-session": bookingSession() },
    },
  ).then((res) => res.items || []);
}

/**
 * Purchase a session package for a service.
 * @param {string} serviceId
 * @param {{customerName: string, customerPhone: string, customerEmail?: string, notes?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function purchaseServicePackage(serviceId, input) {
  return requestPluginAction(
    "bookings",
    "services/" + encodeURIComponent(serviceId) + "/package/purchase",
    {
      method: "POST",
      data: input,
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * Purchase a package for an event series and register across its sessions.
 * @param {string} eventId
 * @param {{customerName: string, customerPhone: string, customerEmail?: string, notes?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function purchaseEventPackage(eventId, input) {
  return requestPluginAction(
    "bookings",
    "events/" + encodeURIComponent(eventId) + "/package/purchase",
    {
      method: "POST",
      data: input,
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * Create a new saved location.
 * @param {{name: string, address: string, description?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function createSavedLocation(input) {
  return bookingAction("locations", input, "POST");
}

/**
 * List saved locations with optional search and pagination.
 * @param {{search?: string, limit?: number, offset?: number, skip?: number}=} query
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listSavedLocations(query = {}) {
  return requestPluginAction("bookings", "locations", {
    method: "GET",
    query,
    headers: { "x-booking-session": bookingSession() },
  });
}

/**
 * Get a saved location by ID.
 * @param {string} locationId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getSavedLocation(locationId) {
  return requestPluginAction(
    "bookings",
    "locations/" + encodeURIComponent(locationId),
    {
      method: "GET",
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * Update an existing saved location.
 * @param {string} locationId
 * @param {{name?: string, address?: string, description?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function updateSavedLocation(locationId, input) {
  return requestPluginAction(
    "bookings",
    "locations/" + encodeURIComponent(locationId),
    {
      method: "PATCH",
      data: input,
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * Delete a saved location.
 * @param {string} locationId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function deleteSavedLocation(locationId) {
  return requestPluginAction(
    "bookings",
    "locations/" + encodeURIComponent(locationId),
    {
      method: "DELETE",
      headers: { "x-booking-session": bookingSession() },
    },
  );
}

/**
 * Create a new bookable service.
 * @param {Record<string, unknown>} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function createService(input) {
  return bookingAction("services", input, "POST");
}

/**
 * Update an existing bookable service.
 * @param {string} serviceId
 * @param {Record<string, unknown>} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function updateService(serviceId, input) {
  return requestPluginAction(
    "bookings",
    "services/" + encodeURIComponent(serviceId),
    {
      method: "PUT",
      data: input,
      headers: { "x-booking-session": bookingSession() },
    },
  );
}
