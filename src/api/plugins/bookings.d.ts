/**
 * List bookable availability with remaining seats. Filters travel as query
 * params — an action string containing '?' is path-encoded to '%3F' and 404s.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 * @param {{from?: string, to?: string, resourceId?: string, serviceId?: string}} [filters]
 */
export function listAvailability({ from, to, resourceId, serviceId }?: {
    from?: string;
    to?: string;
    resourceId?: string;
    serviceId?: string;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * Slot rows for the BookingFlow listSlots prop. The server already
 * returns only bookable future slots, so BookingFlow's own filter argument is
 * ignored; pass { from, to, resourceId, serviceId } to narrow.
 * @param {Record<string,unknown>=} query
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listSlots(query?: Record<string, unknown> | undefined): Promise<import("../joorchin.js").ApiResult>;
/**
 * Get details for a specific slot.
 * @param {string} slotId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getSlot(slotId: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Reserve seats of a slot through the atomic server route.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 * @param {{slotId: string, customerName: string, customerPhone: string, customerEmail?: string, seats?: number, notes?: string, intake?: Record<string, unknown>, creditId?: string}} input
 * @example
 * const slots = await listSlots({ serviceId, from: '2026-10-10', to: '2026-10-17' });
 * const booking = await bookSlot({ slotId: slots[0]._id, customerName: 'سارا', customerPhone: '09121234567' });
 */
export function bookSlot({ slotId, customerName, customerPhone, customerEmail, seats, notes, intake, creditId, }: {
    slotId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    seats?: number;
    notes?: string;
    intake?: Record<string, unknown>;
    creditId?: string;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * Cancel an owned reservation and restore its seats.
 * @param {string} bookingId
 * @param {string} [reason]
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function cancelMyBooking(bookingId: string, reason?: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Reschedule a booking to a new slot.
 * @param {string} bookingId
 * @param {string} newSlotId
 * @param {string} reason
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function rescheduleBooking(bookingId: string, newSlotId: string, reason: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * List the current user or session's bookings.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listMyBookings(): Promise<import("../joorchin.js").ApiResult>;
/**
 * Get details for a specific booking.
 * @param {string} bookingId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getBooking(bookingId: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * List active bookable services.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listServices(): Promise<import("../joorchin.js").ApiResult>;
/**
 * List active staff members / resources.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listResources(): Promise<import("../joorchin.js").ApiResult>;
/**
 * List the current client's session package credits.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function myCredits(): Promise<import("../joorchin.js").ApiResult>;
/**
 * List upcoming scheduled events.
 * @param {{from?: string, to?: string, status?: string, includePast?: boolean, limit?: number, skip?: number}=} query
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listEvents(query?: {
    from?: string;
    to?: string;
    status?: string;
    includePast?: boolean;
    limit?: number;
    skip?: number;
} | undefined): Promise<import("../joorchin.js").ApiResult>;
/**
 * Get details for a specific event.
 * @param {string} eventId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getEvent(eventId: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Register seats for a scheduled event.
 * @param {{eventId: string, customerName: string, customerPhone: string, customerEmail?: string, seats?: number, notes?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function bookEvent({ eventId, customerName, customerPhone, customerEmail, seats, notes, }: {
    eventId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    seats?: number;
    notes?: string;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * Cancel an event registration and restore seats.
 * @param {string} registrationId
 * @param {string} [reason]
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function cancelMyEventRegistration(registrationId: string, reason?: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * List the current user or session's event registrations.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listMyEvents(): Promise<import("../joorchin.js").ApiResult>;
/**
 * List bookings for a specific slot (session/user scoped for visitors).
 * @param {string} slotId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listSlotBookings(slotId: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Purchase a session package for a service.
 * @param {string} serviceId
 * @param {{customerName: string, customerPhone: string, customerEmail?: string, notes?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function purchaseServicePackage(serviceId: string, input: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * Purchase a package for an event series and register across its sessions.
 * @param {string} eventId
 * @param {{customerName: string, customerPhone: string, customerEmail?: string, notes?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function purchaseEventPackage(eventId: string, input: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * Create a new saved location.
 * @param {{name: string, address: string, description?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function createSavedLocation(input: {
    name: string;
    address: string;
    description?: string;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * List saved locations with optional search and pagination.
 * @param {{search?: string, limit?: number, offset?: number, skip?: number}=} query
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listSavedLocations(query?: {
    search?: string;
    limit?: number;
    offset?: number;
    skip?: number;
} | undefined): Promise<import("../joorchin.js").ApiResult>;
/**
 * Get a saved location by ID.
 * @param {string} locationId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getSavedLocation(locationId: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Update an existing saved location.
 * @param {string} locationId
 * @param {{name?: string, address?: string, description?: string}} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function updateSavedLocation(locationId: string, input: {
    name?: string;
    address?: string;
    description?: string;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * Delete a saved location.
 * @param {string} locationId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function deleteSavedLocation(locationId: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Create a new bookable service.
 * @param {Record<string, unknown>} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function createService(input: Record<string, unknown>): Promise<import("../joorchin.js").ApiResult>;
/**
 * Update an existing bookable service.
 * @param {string} serviceId
 * @param {Record<string, unknown>} input
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function updateService(serviceId: string, input: Record<string, unknown>): Promise<import("../joorchin.js").ApiResult>;
/**
 * Reserve seats of a slot through the atomic server route.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 * @param {{slotId: string, customerName: string, customerPhone: string, customerEmail?: string, seats?: number, notes?: string, intake?: Record<string, unknown>, creditId?: string}} input
 * @example
 * const slots = await listSlots({ serviceId, from: '2026-10-10', to: '2026-10-17' });
 * const booking = await bookSlot({ slotId: slots[0]._id, customerName: 'سارا', customerPhone: '09121234567' });
 */
export function createBooking({ slotId, customerName, customerPhone, customerEmail, seats, notes, intake, creditId, }: {
    slotId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    seats?: number;
    notes?: string;
    intake?: Record<string, unknown>;
    creditId?: string;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * List the current user or session's bookings.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listBookings(): Promise<import("../joorchin.js").ApiResult>;
