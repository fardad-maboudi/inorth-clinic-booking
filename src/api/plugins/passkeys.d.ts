/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function supportsPasskeys(): Promise<import("../joorchin.js").ApiResult>;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function signInWithPasskey(): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {string} name
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function enrollPasskey(name: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listPasskeys(): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {string} credentialId
 * @param {string} name
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function renamePasskey(credentialId: string, name: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {string} credentialId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function revokePasskey(credentialId: string): Promise<import("../joorchin.js").ApiResult>;
