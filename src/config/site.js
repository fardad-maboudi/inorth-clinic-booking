/**
 * Single source of truth for the site's active logo and the clinic's public facts.
 * `logoUrl` is overwritten when a logo is generated; the rest is plain content.
 */
import '../demo/install.js';

export const siteConfig = {
  /** Public asset URL of the active logo SVG, e.g. "/assets/abc123". Empty = none. */
  logoUrl: '/logo.svg',
  name: 'کلینیک زیبایی نیلوفر',
  tagline: 'پوست، مو و آرامش، زیر نظر متخصصان',
  address: 'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۱۸، طبقه سوم',
  phone: '۰۲۱-۲۲۰۰۰۰۰۰',
  hours: [
    ['شنبه تا چهارشنبه', '۱۰ تا ۱۹'],
    ['پنجشنبه', '۱۰ تا ۱۴'],
    ['جمعه', 'تعطیل'],
  ],
};

export default siteConfig;
