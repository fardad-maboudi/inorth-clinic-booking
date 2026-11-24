/**
 * Client-side validation from the plugins' own model definitions — import from
 * '@/api/validate'. It mirrors the server's rules (required, enum, min/max,
 * length, pattern) so a form can show the message before the round trip; the
 * server stays the authority.
 *
 *   const form = useFormState({
 *     initialValues: { rating: 0, comment: '' },
 *     schema: (values) => validateRow('reviews', 'review', values),
 *     onSubmit: createReview,
 *   });
 */
import { PLUGIN_RULES as RULES } from './plugin-rules.js';

const toLatin = (value) =>
  String(value)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);
const isEmpty = (value) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * Validate one value against a compact rule (`{t, r, e, min, max, minL, maxL, p, l}`).
 * Returns a Persian message, or '' when valid.
 * @param {Record<string, any>} rule
 * @param {unknown} value
 * @param {string} [name]
 * @returns {string}
 */
export function validateField(rule, value, name = '') {
  const label = rule.l || name || 'این فیلد';
  if (isEmpty(value)) return rule.r ? `${label} الزامی است.` : '';
  if (rule.t === 'number') {
    const n = Number(toLatin(value));
    if (!Number.isFinite(n)) return `${label} باید عدد باشد.`;
    if (rule.min !== undefined && n < rule.min) return `${label} نباید کمتر از ${fa(rule.min)} باشد.`;
    if (rule.max !== undefined && n > rule.max) return `${label} نباید بیشتر از ${fa(rule.max)} باشد.`;
  } else if (rule.t === 'array') {
    const count = Array.isArray(value) ? value.length : 0;
    if (rule.min !== undefined && count < rule.min) return `${label} حداقل ${fa(rule.min)} مورد لازم دارد.`;
    if (rule.max !== undefined && count > rule.max) return `${label} حداکثر ${fa(rule.max)} مورد می‌پذیرد.`;
  } else if (rule.t === 'string' || rule.t === 'objectId' || rule.t === 'date') {
    const text = String(value);
    if (rule.minL !== undefined && text.length < rule.minL) return `${label} حداقل ${fa(rule.minL)} نویسه باشد.`;
    if (rule.maxL !== undefined && text.length > rule.maxL) return `${label} حداکثر ${fa(rule.maxL)} نویسه باشد.`;
    if (rule.p) {
      try {
        if (!new RegExp(rule.p).test(text)) return `${label} معتبر نیست.`;
      } catch {
        /* a rule the browser cannot compile is left to the server */
      }
    }
  }
  if (rule.e && !rule.e.includes(value)) return `${label} معتبر نیست.`;
  return '';
}

/**
 * Validate form values for a plugin entity. Returns `{ field: message }` (empty
 * when valid). Unknown plugin/entity returns `{}` — the server still validates.
 * Only fields present in `values` are checked unless they are required.
 * @param {string} pluginId
 * @param {string} entity
 * @param {Record<string, unknown>} values
 * @returns {Record<string, string>}
 */
export function validateRow(pluginId, entity, values) {
  const rules = RULES?.[pluginId]?.[entity];
  if (!rules) return {};
  const errors = {};
  for (const [name, rule] of Object.entries(rules)) {
    const message = validateField(rule, values?.[name], name);
    if (message) errors[name] = message;
  }
  return errors;
}

/** The rule table for one entity, e.g. to render `maxLength` on an input. */
export function rulesFor(pluginId, entity) {
  return RULES?.[pluginId]?.[entity] ?? null;
}
