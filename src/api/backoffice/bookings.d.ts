export function confirmBooking(bookingId: string): Promise<import("./client.js").ApiResult>;
export function completeBooking(bookingId: string): Promise<import("./client.js").ApiResult>;
export function noShowBooking(bookingId: string): Promise<import("./client.js").ApiResult>;
export function checkInBooking(bookingId: string): Promise<import("./client.js").ApiResult>;
export function getBooking(bookingId: string): Promise<import("./client.js").ApiResult>;
export function cancelBooking(bookingId: string, body?: {
    reason?: string;
} | undefined): Promise<import("./client.js").ApiResult>;
export function rescheduleBooking(bookingId: string, body: {
    newSlotId: string;
    reason?: string;
}): Promise<import("./client.js").ApiResult>;
export function getAvailability(query?: Record<string, unknown> | undefined): Promise<import("./client.js").ApiResult>;
export function createWalkIn(input: {
    serviceId?: string;
    resourceId?: string;
    startsAt?: string;
    endsAt?: string;
    customerName: string;
    customerPhone?: string;
    notes?: string;
    price?: number;
}): Promise<import("./client.js").ApiResult>;
export function createSlots(input: {
    resource: string;
    service?: string;
    startsAt: string;
    endsAt: string;
    capacity?: number;
    price?: number;
    mode?: string;
    notes?: string;
} | Array<{
    resource: string;
    service?: string;
    startsAt: string;
    endsAt: string;
    capacity?: number;
    price?: number;
    mode?: string;
    notes?: string;
}>): Promise<import("./client.js").ApiResult>;
export function createRecurringSlots(input: {
    serviceId?: string;
    resourceId: string;
    startDate: string;
    endDate: string;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    bufferMinutes?: number;
    capacity?: number;
    price?: number;
    mode?: string;
}): Promise<import("./client.js").ApiResult>;
export function deleteSlot(slotId: string, options?: {
    force?: boolean;
} | undefined): Promise<import("./client.js").ApiResult>;
export function bulkDeleteSlots(slotIds: string[], options?: {
    force?: boolean;
} | undefined): Promise<import("./client.js").ApiResult>;
export function deleteSlotsByRange(input: {
    from: string;
    to: string;
    resourceId?: string;
    serviceId?: string;
    onlyEmpty?: boolean;
    force?: boolean;
}): Promise<import("./client.js").ApiResult>;
export function generateSlots(input?: {
    daysAhead?: number;
    startDate?: string;
    endDate?: string;
    resourceId?: string;
} | undefined): Promise<import("./client.js").ApiResult>;
export function getCalendar(query?: {
    from?: string;
    to?: string;
    resourceId?: string;
    limit?: number;
    skip?: number;
} | undefined): Promise<import("./client.js").ApiResult>;
export function grantCredit(input: {
    clientId: string;
    totalSessions: number;
    serviceId?: string;
    eventId?: string;
    validityDays?: number;
    scheduleMode?: string;
    notes?: string;
}): Promise<import("./client.js").ApiResult>;
export function consumeCredit(creditId: string, input?: {
    sessions?: number;
    notes?: string;
} | undefined): Promise<import("./client.js").ApiResult>;
export function listClientCredits(clientId: string, query?: {
    limit?: number;
    skip?: number;
    sort?: string;
} | undefined): Promise<import("./client.js").ApiResult>;
export function createEvent(input: {
    title: string;
    description?: string;
    place: string;
    price?: number;
    currency?: string;
    capacity?: number;
    startsAt: string;
    endsAt: string;
    recurrence?: Record<string, unknown>;
    image?: string;
    mode?: string;
    package?: Record<string, unknown>;
}): Promise<import("./client.js").ApiResult>;
export function updateEvent(eventId: string, input: Record<string, unknown>): Promise<import("./client.js").ApiResult>;
export function cancelEvent(eventId: string, input?: {
    reason?: string;
    cancelSeries?: boolean;
} | undefined): Promise<import("./client.js").ApiResult>;
export function listEventRegistrations(eventId: string, query?: {
    limit?: number;
    skip?: number;
} | undefined): Promise<import("./client.js").ApiResult>;
export function getGoogleOAuthStartUrl(): Promise<{
    url: string;
}>;
export function handleGoogleOAuthCallback(code: string): Promise<import("./client.js").ApiResult>;
export function getGoogleStatus(): Promise<{
    connected: boolean;
    email?: string;
}>;
export function disconnectGoogle(): Promise<import("./client.js").ApiResult>;
export function getStaffGoogleOAuthStartUrl(resourceId: string, query?: {
    redirectUri?: string;
} | undefined): Promise<{
    url: string;
}>;
export function handleStaffGoogleOAuthCallback(resourceId: string, body: {
    code: string;
    redirectUri?: string;
    state?: string;
}): Promise<import("./client.js").ApiResult>;
export function getStaffGoogleStatus(resourceId: string): Promise<{
    connected: boolean;
    email?: string;
    selectedCalendarId?: string;
    lastSyncedAt?: string;
    lastError?: string;
}>;
export function disconnectStaffGoogle(resourceId: string): Promise<import("./client.js").ApiResult>;
export function getStaffGoogleCalendars(resourceId: string): Promise<{
    calendars: Array<{
        id: string;
        summary: string;
        primary?: boolean;
        timeZone?: string;
    }>;
}>;
export function setStaffGoogleCalendar(resourceId: string, body: {
    calendarId: string;
}): Promise<import("./client.js").ApiResult>;
export function createSavedLocation(input: {
    name: string;
    address: string;
    description?: string;
}): Promise<import("./client.js").ApiResult>;
export function listSavedLocations(query?: {
    search?: string;
    limit?: number;
    offset?: number;
    skip?: number;
} | undefined): Promise<import("./client.js").ApiResult>;
export function getSavedLocation(locationId: string): Promise<import("./client.js").ApiResult>;
export function updateSavedLocation(locationId: string, input: {
    name?: string;
    address?: string;
    description?: string;
}): Promise<import("./client.js").ApiResult>;
export function deleteSavedLocation(locationId: string): Promise<import("./client.js").ApiResult>;
export function createService(input: Record<string, unknown>): Promise<import("./client.js").ApiResult>;
export function updateService(serviceId: string, input: Record<string, unknown>): Promise<import("./client.js").ApiResult>;
