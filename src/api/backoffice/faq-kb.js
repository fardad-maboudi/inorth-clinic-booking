/**
 * Site back-office SDK — faq-kb: FAQ entries, including inactive ones.
 *
 * For the site's owner, admins and team only; every call needs a staff
 * capability and 403s for customers. Visitor and customer pages use
 * '@/api/plugins/faq-kb' instead. Installed and owned by the platform.
 */
import { pluginRecords } from './client.js';

const faqRows = pluginRecords('faq-kb', 'faq');
/** Every faq row, not only the caller's. */
export const listFaqs = (query = {}) => faqRows.list(query);
export const getFaq = (id) => faqRows.get(id);
export const createFaq = (data) => faqRows.create(data);
export const updateFaq = (id, data) => faqRows.update(id, data);
export const deleteFaq = (id) => faqRows.remove(id);
