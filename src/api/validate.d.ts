/**
 * Validate one value against a compact rule (`{t, r, e, min, max, minL, maxL, p, l}`).
 * Returns a Persian message, or '' when valid.
 * @param {Record<string, any>} rule
 * @param {unknown} value
 * @param {string} [name]
 * @returns {string}
 */
export function validateField(rule: Record<string, any>, value: unknown, name?: string): string;
/**
 * Validate form values for a plugin entity. Returns `{ field: message }` (empty
 * when valid). Unknown plugin/entity returns `{}` — the server still validates.
 * Only fields present in `values` are checked unless they are required.
 * @param {string} pluginId
 * @param {string} entity
 * @param {Record<string, unknown>} values
 * @returns {Record<string, string>}
 */
export function validateRow(pluginId: string, entity: string, values: Record<string, unknown>): Record<string, string>;
/** The rule table for one entity, e.g. to render `maxLength` on an input. */
export function rulesFor(pluginId: any, entity: any): Record<string, Record<string, any>>;
