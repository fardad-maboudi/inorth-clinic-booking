/**
 * @param {string|null|undefined} token
 */
export function setPreviewToken(token: string | null | undefined): void;
/**
 * Adopt a server-verified runtime session without persisting it across reloads.
 * @param {string|null|undefined} token
 * @returns {boolean}
 */
export function setInMemoryAuthToken(token: string | null | undefined): boolean;
/** End a runtime session without reusing a stored website identity. */
export function clearInMemoryAuthToken(exitRuntime?: boolean): void;
/**
 * @returns {string|null}
 */
export function getPreviewToken(): string | null;
export function getAuthHeaders(): {
    Authorization: string;
} | {
    Authorization?: undefined;
};
/** Accept preview token from studio iframe parent or ?preview_token= URL param. */
export function initPreviewAuthListener(): void;
/** UI-only hint visibility; backend authorization still verifies the token. */
export function isOwnerStudioPreview(): boolean;
/** Persian and Arabic digits to ASCII. @param {unknown} value */
export function toLatinDigits(value: unknown): string;
/** Canonical ASCII +989XXXXXXXXX, or null. @param {unknown} raw */
export function normalizeIranianMobile(raw: unknown): string;
/** Display an Iranian mobile locally, preserving other values. @param {unknown} raw */
export function formatIranianMobile(raw: unknown): string;
