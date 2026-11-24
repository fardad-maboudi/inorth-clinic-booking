/**
 * faq-kb plugin client — import from '@/api/plugins/faq-kb'.
 * Thin wrappers over the Joorchin plugin-data SDK (shared multi-tenant collections,
 * provisioned on install). Never hardcode /api/v1/apps URLs — the SDK injects the app id.
 */
import {
  listPluginRecords,
  getPluginRecord,
} from '@/api/joorchin';

const PLUGIN_ID = 'faq-kb';

/**
 * @param {Record<string,unknown>=} params
 * @returns {Promise<import('../joorchin.js').RowList<import('../plugin-models.js').FaqKbFaqRow>>}
 */
export async function listFaqs(params = {}) {
  return listPluginRecords(PLUGIN_ID, 'faq', params);
}

/**
 * @param {string} id
 * @returns {Promise<import('../plugin-models.js').FaqKbFaqRow>}
 */
export async function getFaq(id) {
  return getPluginRecord(PLUGIN_ID, 'faq', id);
}
