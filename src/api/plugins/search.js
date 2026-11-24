/**
 * Search plugin client — server-side search through the trusted scope lane.
 * Import from '@/api/plugins/search'.
 */
import { getPluginAction } from '@/api/joorchin';

/**
 * Search an entity by plain text. The SERVER builds the query from each
 * model's searchableFields (title/name/description when undeclared).
 * Client-side $or/$regex filters are stripped and never worked.
 * Pass entities: ['product','post'] for a site-wide search.
 * @returns {Promise<{ items?: Array, total?: number, groups?: object }>}
 * @param {unknown} entity
 */
export async function searchEntity(entity, /** @type {{q?: unknown, limit?: number, skip?: number, entities?: unknown}} */ { q, limit = 20, skip = 0, entities } = {}) {
  return getPluginAction('search', '', {
    ...(entities ? { entities: Array.isArray(entities) ? entities.join(',') : entities } : { entity }),
    q: q || '',
    limit,
    skip,
  });
}

/**
 * Typeahead: prefix match, ≤8 labels. Same entity/entities rules as searchEntity.
 * @param {unknown} q
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function suggestSearch(q, /** @type {{entity?: unknown, entities?: unknown, limit?: number}} */ { entity, entities, limit = 8 } = {}) {
  return getPluginAction('search', 'suggest', {
    ...(entities ? { entities: Array.isArray(entities) ? entities.join(',') : entities } : { entity }),
    q: q || '',
    limit,
  });
}
