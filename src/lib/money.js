/**
 * قالب‌بندی مبلغ — تنها منبع نمایش قیمت در فروشگاه.
 * مبلغ و واحد پول همیشه از سرور می‌آیند؛ اینجا فقط نمایش داده می‌شوند.
 */
const UNIT_FA = { IRR: 'ریال', IRT: 'تومان', TOMAN: 'تومان' };

/** واحد پیش‌فرض فروشگاه — تومان، مطابق پیش‌فرض تنظیمات فروشگاه. */
export const DEFAULT_CURRENCY = 'IRT';

export function formatMoney(amount, currency) {
  const value = Number(amount) || 0;
  const code = String(currency || DEFAULT_CURRENCY).toUpperCase();
  const unit = UNIT_FA[code];
  if (unit) return new Intl.NumberFormat('fa-IR').format(value) + ' ' + unit;
  try {
    return new Intl.NumberFormat('fa-IR', { style: 'currency', currency: code }).format(value);
  } catch {
    return new Intl.NumberFormat('fa-IR').format(value) + ' ' + code;
  }
}

/** قیمت یک محصول/واریانت با واحد پول خودش. */
export function formatPrice(item) {
  return formatMoney(item?.price ?? item?.unitPrice, item?.currency);
}
