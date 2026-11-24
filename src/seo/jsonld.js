/**
 * schema.org JSON-LD builders for generated pages — import from '@/seo/jsonld'.
 * Pure functions: they take plugin rows (ecommerce product, cms post, faq, …)
 * and return plain objects; `JsonLd` in `@/seo/EntitySeo` renders them. Values
 * that are missing are omitted rather than emitted empty, because Google drops
 * structured data with blank required fields.
 */

const compact = (object) =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );

const absolute = (url, origin) => {
  if (!url) return undefined;
  try {
    return new URL(url, origin || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')).href;
  } catch {
    return undefined;
  }
};

/** Rial/toman → ISO currency code schema.org accepts. Toman is a rial/10 display unit; both map to IRR. */
const currencyCode = (currency) => (!currency || ['IRR', 'IRT', 'TOMAN'].includes(String(currency).toUpperCase()) ? 'IRR' : String(currency).toUpperCase());

/** Price in the unit the page shows; IRT/toman rows are converted to rial for schema.org. */
const priceInRial = (price, currency) => {
  const value = Number(price);
  if (!Number.isFinite(value)) return undefined;
  return ['IRT', 'TOMAN'].includes(String(currency || '').toUpperCase()) ? value * 10 : value;
};

/**
 * @param {Record<string, any>} product an ecommerce product row
 * @param {{origin?: string, url?: string, brand?: string, rating?: {ratingValue?: number, reviewCount?: number}}} [options]
 */
export function productJsonLd(product, { origin, url, brand, rating } = {}) {
  if (!product) return null;
  const inStock = product.stock === undefined || product.stock === null ? undefined : Number(product.stock) > 0;
  const images = (Array.isArray(product.images) ? product.images : product.image ? [product.image] : []).map((src) => absolute(src, origin)).filter(Boolean);
  const price = priceInRial(product.price, product.currency);
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title || product.name,
    description: product.description,
    sku: product.sku,
    image: images,
    brand: brand ? { '@type': 'Brand', name: brand } : undefined,
    aggregateRating: rating && Number(rating.reviewCount) > 0
      ? { '@type': 'AggregateRating', ratingValue: Number(rating.ratingValue), reviewCount: Number(rating.reviewCount) }
      : undefined,
    offers: price === undefined ? undefined : compact({
      '@type': 'Offer',
      price,
      priceCurrency: currencyCode(product.currency),
      availability: inStock === undefined ? undefined : inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: absolute(url, origin),
    }),
  });
}

/**
 * @param {Record<string, any>} post a cms post row
 * @param {{origin?: string, url?: string, publisher?: string, authorName?: string}} [options]
 */
export function articleJsonLd(post, { origin, url, publisher, authorName } = {}) {
  if (!post) return null;
  const cover = Array.isArray(post.coverImage) ? post.coverImage[0] : post.coverImage || post.image;
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.summary || post.description,
    image: absolute(cover, origin),
    datePublished: post.publishedAt || post.created_at,
    dateModified: post.updated_at || post.publishedAt || post.created_at,
    author: authorName || post.authorName ? { '@type': 'Person', name: authorName || post.authorName } : undefined,
    publisher: publisher ? { '@type': 'Organization', name: publisher } : undefined,
    mainEntityOfPage: absolute(url, origin),
  });
}

/** @param {Array<{name: string, url?: string}>} trail home → … → current page */
export function breadcrumbJsonLd(trail, { origin } = {}) {
  const items = (trail || []).filter((item) => item && item.name);
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => compact({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.url, origin),
    })),
  };
}

/** @param {Array<{question?: string, answer?: string, q?: string, a?: string}>} entries faq-kb rows */
export function faqJsonLd(entries) {
  const rows = (entries || [])
    .map((entry) => ({ question: entry.question || entry.q, answer: entry.answer || entry.a }))
    .filter((entry) => entry.question && entry.answer);
  if (!rows.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rows.map((entry) => ({ '@type': 'Question', name: entry.question, acceptedAnswer: { '@type': 'Answer', text: entry.answer } })),
  };
}

/** @param {{name: string, url?: string, logo?: string, sameAs?: string[]}} org */
export function organizationJsonLd(org, { origin } = {}) {
  if (!org?.name) return null;
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: absolute(org.url || '/', origin),
    logo: absolute(org.logo, origin),
    sameAs: org.sameAs,
  });
}

/**
 * Serialise for a `<script type="application/ld+json">` body. `<` is escaped so
 * row text such as "</script>" cannot end the tag early.
 */
export function serializeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
