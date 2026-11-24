/**
 * Search an entity by plain text. The SERVER builds the query from each
 * model's searchableFields (title/name/description when undeclared).
 * Client-side $or/$regex filters are stripped and never worked.
 * Pass entities: ['product','post'] for a site-wide search.
 * @returns {Promise<{ items?: Array, total?: number, groups?: object }>}
 * @param {unknown} entity
 */
export function searchEntity(entity: unknown, { q, limit, skip, entities }?: {
    q?: unknown;
    limit?: number;
    skip?: number;
    entities?: unknown;
}): Promise<{
    items?: any[];
    total?: number;
    groups?: object;
}>;
/**
 * Typeahead: prefix match, ≤8 labels. Same entity/entities rules as searchEntity.
 * @param {unknown} q
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function suggestSearch(q: unknown, { entity, entities, limit }?: {
    entity?: unknown;
    entities?: unknown;
    limit?: number;
}): Promise<import("../joorchin.js").ApiResult>;
