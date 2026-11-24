/**
 * @param {string} token
 */
export function setAuthToken(token: string): void;
export function clearAuthToken(): void;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function refreshSession(): Promise<import("../joorchin.js").ApiResult>;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function hasAuthToken(): Promise<import("../joorchin.js").ApiResult>;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getUserAuthHeaders(): Promise<import("../joorchin.js").ApiResult>;
/** Customer OTP request for this site (site_user); dashboard staff use requestAdminOtp.
 * @param {string} phoneNumber  * @returns {Promise<import('../joorchin.js').ApiResult>}
 * @example
 * await requestOtp('09121234567');
 * const session = await verifyOtp('09121234567', '12345'); // signs the customer in
 */
export function requestOtp(phoneNumber: string): Promise<import("../joorchin.js").ApiResult>;
/** Customer OTP verification (site_user); saves the SDK session. Staff use verifyAdminOtp.
 * @param {string} phoneNumber
 * @param {string} otp  * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function verifyOtp(phoneNumber: string, otp: string): Promise<import("../joorchin.js").ApiResult>;
/** Site customer password login (site_user); staff use loginAdminWithPassword.
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function loginWithPassword(phoneNumber: string, password: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Uniform response: callers must not infer whether this phone has an account.
 * @param {string} phoneNumber
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function forgotPassword(phoneNumber: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Verify the reset code and set a new password; the user signs in afterwards.
 * @param {string} phoneNumber
 * @param {unknown} otp
 * @param {unknown} newPassword
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function resetPassword(phoneNumber: string, otp: unknown, newPassword: unknown): Promise<import("../joorchin.js").ApiResult>;
/** Shop owner/admin/invited staff OTP request (site_admin). Requires active membership. Never Joorchin platform-admin login.
 * @param {string} phoneNumber  * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function requestAdminOtp(phoneNumber: string): Promise<import("../joorchin.js").ApiResult>;
/** Shop-staff OTP verification (site_admin); saves the SDK session. Never use customer verifyOtp for dashboard access.
 * @param {string} phoneNumber
 * @param {string} otp  * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function verifyAdminOtp(phoneNumber: string, otp: string): Promise<import("../joorchin.js").ApiResult>;
/** Shop-staff password login (site_admin); server rechecks active membership. Never platform operators.
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function loginAdminWithPassword(phoneNumber: string, password: string): Promise<import("../joorchin.js").ApiResult>;
/** Staff password recovery; requires active admin membership or an invitation for this site.
 * @param {string} phoneNumber
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function forgotAdminPassword(phoneNumber: string): Promise<import("../joorchin.js").ApiResult>;
/** Rechecks admin membership before resetting the password; sign in again afterwards.
 * @param {string} phoneNumber
 * @param {string} otp
 * @param {string} newPassword
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function resetAdminPassword(phoneNumber: string, otp: string, newPassword: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function me(): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {Record<string,unknown>} payload
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function updateMe(payload: Record<string, unknown>): Promise<import("../joorchin.js").ApiResult>;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function logout(): Promise<import("../joorchin.js").ApiResult>;
/** Current caller profile. No staff authority is inferred from its role.
 * @param {{enabled?:boolean}} [options]
 * @returns {{data: import('../joorchin.js').ApiResult|undefined, error: Error|null, isPending: boolean, refetch: Function}}
 */
export function useCustomerProfile(options?: {
    enabled?: boolean;
}): {
    data: import("../joorchin.js").ApiResult | undefined;
    error: Error | null;
    isPending: boolean;
    refetch: Function;
};
/** Same-origin shopper return destination, with external/ambiguous paths rejected.
 * @param {unknown} value @param {string} [fallback]
 * @returns {string}
 */
export function safeReturnPath(value: unknown, fallback?: string): string;
/** Derived from auth's required page-file contract; safe for return redirects. */
export const AUTH_LOGIN_PATH: "/auth/login";
/** Shared staff login route installed with the auth plugin. */
export const SITE_ADMIN_LOGIN_PATH: "/admin/login";
export const APP_ID: any;
export const APP_BASE: string;
