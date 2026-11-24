/* eslint-disable react-refresh/only-export-components -- re-exports the pure builders next to the components */
import { SeoHead } from './SeoHead';
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, productJsonLd, serializeJsonLd } from './jsonld';

export { articleJsonLd, breadcrumbJsonLd, faqJsonLd, organizationJsonLd, productJsonLd } from './jsonld';

/** Renders one schema.org object; renders nothing for null/undefined. */
export function JsonLd({ data }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

/**
 * Title, description, social image and Product structured data for an
 * ecommerce product page: `<ProductSeo product={product} rating={summary} />`.
 */
export function ProductSeo({ product, rating, brand, canonical }) {
  if (!product) return null;
  const image = Array.isArray(product.images) ? product.images[0] : product.image;
  return (
    <>
      <SeoHead title={product.title || product.name} description={product.description} ogImage={image} canonical={canonical} />
      <JsonLd data={productJsonLd(product, { url: canonical, brand, rating })} />
    </>
  );
}

/** Article SEO for a cms post: `<ArticleSeo post={post} publisher="نام سایت" />`. */
export function ArticleSeo({ post, publisher, authorName, canonical }) {
  if (!post) return null;
  const cover = Array.isArray(post.coverImage) ? post.coverImage[0] : post.coverImage || post.image;
  return (
    <>
      <SeoHead title={post.title} description={post.excerpt || post.summary || post.description} ogImage={cover} canonical={canonical} />
      <JsonLd data={articleJsonLd(post, { url: canonical, publisher, authorName })} />
    </>
  );
}

/** FAQ page structured data from faq-kb rows. */
export function FaqSeo({ entries }) {
  return <JsonLd data={faqJsonLd(entries)} />;
}

/** Breadcrumb structured data: `<BreadcrumbSeo trail={[{ name: 'خانه', url: '/' }, { name: product.title }]} />`. */
export function BreadcrumbSeo({ trail }) {
  return <JsonLd data={breadcrumbJsonLd(trail)} />;
}
