/**
 * @param {Record<string,unknown>=} params
 * @returns {Promise<import('../joorchin.js').RowList<import('../plugin-models.js').FaqKbFaqRow>>}
 */
export function listFaqs(params?: Record<string, unknown> | undefined): Promise<import("../joorchin.js").RowList<import("../plugin-models.js").FaqKbFaqRow>>;
/**
 * @param {string} id
 * @returns {Promise<import('../plugin-models.js').FaqKbFaqRow>}
 */
export function getFaq(id: string): Promise<import("../plugin-models.js").FaqKbFaqRow>;
