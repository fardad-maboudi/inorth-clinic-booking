import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/money';

const BUSINESS_NAME = "فروشگاه آنلاین";
const SHOP_PATH = '/shop/products';
const CART_PATH = '/shop/cart';

export function AnnouncementBar({ message }) {
  const key = 'joorchin:shop-announcement';
  const [open, setOpen] = useState(() => sessionStorage.getItem(key) !== 'hidden');
  if (!message || !open) return null;
  return <div className="relative bg-ink px-12 py-2 text-center text-xs text-surface sm:text-sm"><p>{message}</p><button type="button" aria-label="بستن اطلاعیه" onClick={() => { sessionStorage.setItem(key, 'hidden'); setOpen(false); }} className="absolute end-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2">×</button></div>;
}



export function BackToTop() {
  const [shown, setShown] = useState(false);
  useEffect(() => { const onScroll = () => setShown(window.scrollY > 500); onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  return shown ? <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })} aria-label="بازگشت به بالای صفحه" className="fixed bottom-5 end-5 z-30 min-h-11 min-w-11 rounded-full border border-neutral-300 bg-surface shadow-lg">↑</button> : null;
}


export function HeroSlider({ slides = [] }) {
  const safe = slides.filter(Boolean);
  const [active, setActive] = useState(0);
  useEffect(() => { if (safe.length < 2) return; const id = setInterval(() => setActive((value) => (value + 1) % safe.length), 6000); return () => clearInterval(id); }, [safe.length]);
  if (!safe.length) return null;
  const slide = safe[active];
  return <section aria-roledescription="carousel" aria-label="پیشنهادهای فروشگاه" className="relative isolate overflow-hidden bg-neutral-950 text-white"><div className="mx-auto grid min-h-[30rem] max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2"><div className="z-10"><p className="text-sm font-bold text-white/70">{slide.kicker}</p><h1 className="mt-4 max-w-2xl font-heading text-4xl font-black leading-tight sm:text-6xl">{slide.title}</h1><p className="mt-5 max-w-xl text-lg leading-8 text-white/75">{slide.body}</p><Link to={slide.href || SHOP_PATH} className="mt-8 inline-flex min-h-12 items-center rounded-full bg-white px-7 font-bold text-neutral-950">{slide.action || 'مشاهده محصولات'}</Link></div>{slide.image && <img src={slide.image} alt="" className="h-full max-h-[34rem] w-full object-cover lg:absolute lg:inset-y-0 lg:end-0 lg:w-1/2" />}</div>{safe.length > 1 && <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">{safe.map((item, index) => <button key={item.title} type="button" aria-label={`اسلاید ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)} className={`min-h-11 min-w-11 rounded-full after:mx-auto after:block after:size-2 after:rounded-full ${index === active ? 'after:bg-white' : 'after:bg-white/40'}`} />)}</div>}</section>;
}

export function CategoryRail({ categories = [] }) {
  if (!categories.length) return null;
  return <section id="categories" aria-labelledby="category-title" className="mx-auto max-w-7xl px-4 py-14 sm:px-6"><div className="flex items-end justify-between"><h2 id="category-title" className="font-heading text-2xl font-black">دسته‌بندی‌ها</h2><Link to={SHOP_PATH} className="min-h-11 py-3 text-sm font-bold text-brand-600">مشاهده همه</Link></div><div className="mt-7 flex snap-x gap-5 overflow-x-auto pb-3">{categories.map((category) => <Link key={category._id || category.id} to={`${SHOP_PATH}?categoryId=${encodeURIComponent(category._id || category.id)}`} className="group w-28 shrink-0 snap-start text-center sm:w-36">{category.image ? <img src={category.image} alt="" className="aspect-square w-full rounded-full object-cover transition group-hover:scale-[1.03]" /> : <span className="grid aspect-square w-full place-items-center rounded-full bg-neutral-100 text-3xl">◇</span>}<span className="mt-3 block text-sm font-bold">{category.name || category.title}</span></Link>)}</div></section>;
}

/**
 * Approved-review rating badge. The ONLY rating source is the reviews plugin's
 * approved aggregate — `reviewSummary(id)` / `reviewSummaries(ids)[id]` from
 * '@/api/plugins/reviews' ({ count, averageRating }). Product rows carry no
 * rating: the old seeded rating fields were fabricated and the client strips them.
 * Renders nothing without at least one approved review.
 */
export function RatingBadge({ summary, className = '' }) {
  const count = Number(summary?.count) || 0;
  const average = Number(summary?.averageRating) || 0;
  if (count < 1 || average <= 0) return null;
  const avg = average.toLocaleString('fa-IR', { maximumFractionDigits: 1 });
  const total = count.toLocaleString('fa-IR');
  return <p className={'flex items-center gap-1 text-sm text-muted ' + className} aria-label={'امتیاز ' + avg + ' از ۵ بر پایه ' + total + ' دیدگاه تأییدشده'}><span aria-hidden className="text-brand-600">★</span><span aria-hidden>{avg}</span><span aria-hidden>({total})</span></p>;
}

/** `rating`: the approved summary for this product (see RatingBadge); omit when unknown. */
// CartProvider renders mutation failures; card controls consume rejected promises.
export function ProductCard({ product, onAdd, busy, rating }) {
  const id = product._id || product.id;
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const unavailable = product.active === false || (hasVariants ? !product.variants.some((variant) => Number(variant.stock) > 0) : Number(product.stock) <= 0);
  const discount = Number(product.compareAtPrice) > Number(product.price) ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100) : 0;
  return <article className="group relative"><Link to={`/shop/product-detail/${id}`} className="block rounded-2xl outline-none focus:ring-2 focus:ring-brand-600"><div className="relative overflow-hidden rounded-2xl bg-neutral-100">{product.images?.[0] ? <img src={product.images[0]} alt={product.title || ''} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.025] motion-reduce:transition-none" /> : <div className="grid aspect-[4/5] place-items-center text-muted">بدون تصویر</div>}{discount > 0 && <span className="absolute start-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-white">{discount}٪</span>}{unavailable && <span className="absolute inset-x-3 bottom-3 rounded-full bg-neutral-950/85 px-3 py-2 text-center text-sm text-white">ناموجود</span>}</div><h3 className="mt-4 line-clamp-2 min-h-12 font-bold leading-6">{product.title}</h3><RatingBadge summary={rating} className="mt-1" /><div className="mt-1 flex flex-wrap items-baseline gap-2">{discount > 0 && <del className="text-xs text-muted">{formatPrice({ ...product, price: product.compareAtPrice })}</del>}<strong className="text-brand-600">{formatPrice(product)}</strong></div></Link>{hasVariants && !unavailable ? <Link to={`/shop/product-detail/${id}`} className="mt-3 flex min-h-11 items-center justify-center rounded-control border border-brand-600 px-4 text-sm text-brand-600">انتخاب تنوع</Link> : onAdd && !unavailable && <button type="button" disabled={busy} onClick={() => Promise.resolve(onAdd(id, 1)).catch(() => {})} className="mt-3 min-h-11 w-full rounded-xl border border-brand-600 px-4 text-sm font-bold text-brand-600 hover:bg-brand-600 hover:text-on-brand disabled:opacity-50">افزودن به سبد</button>}</article>;
}

/**
 * Catalog grid whose columns follow the space actually left for it. Beside a
 * filter sidebar a 4-column grid at ~850px crammed cards to ~150px, so with
 * `withSidebar` it stays at 2 columns until xl (3) and 2xl (4).
 */
export function ProductGrid({ children, withSidebar = false, className = '' }) {
  const columns = withSidebar ? 'grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return <div data-testid="product-grid" className={'grid gap-x-4 gap-y-10 sm:gap-x-6 ' + columns + ' ' + className}>{children}</div>;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * Catalog filters: a static sidebar from md up; below md a disclosure button
 * (with the active-filter count) that expands the same panel in place, so the
 * results count, sort and first products stay in the first viewport. Focus
 * moves into the panel on open and back to the button on close or Escape.
 */
export function CatalogFilters({ children, activeCount = 0, onReset, title = 'فیلترها', className = '' }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const close = () => { setOpen(false); buttonRef.current?.focus(); };
  useEffect(() => {
    if (!open) return undefined;
    panelRef.current?.querySelector(FOCUSABLE)?.focus();
    const onKey = (event) => { if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const count = Number(activeCount) || 0;
  const reset = onReset && count > 0 ? <button type="button" onClick={onReset} className="min-h-11 px-3 text-sm font-bold text-brand-600">پاک کردن فیلترها</button> : null;
  return <div className={'md:sticky md:top-20 md:self-start ' + className}>
    <div className="flex flex-wrap items-center gap-2 md:hidden">
      <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={panelId} onClick={() => (open ? close() : setOpen(true))} className="inline-flex min-h-11 items-center gap-2 rounded-control border border-neutral-300 px-4 text-sm font-bold">
        {title}{count > 0 && <span className="grid min-w-6 place-items-center rounded-pill bg-brand-600 px-1.5 text-xs text-on-brand" aria-label={count.toLocaleString('fa-IR') + ' فیلتر فعال'}>{count.toLocaleString('fa-IR')}</span>}
      </button>
      {reset}
    </div>
    <section id={panelId} ref={panelRef} aria-label={title} className={(open ? 'block' : 'hidden') + ' mt-3 space-y-6 rounded-surface border border-neutral-200 p-surface md:mt-0 md:block md:border-0 md:p-0'}>
      <div className="hidden items-center justify-between md:flex"><h2 className="font-bold">{title}</h2>{reset}</div>
      {children}
      <button type="button" onClick={close} className="min-h-11 w-full rounded-control bg-brand-600 text-sm font-bold text-on-brand md:hidden">مشاهده نتایج</button>
    </section>
  </div>;
}

/**
 * Load failure with a retry affordance. `message` comes from the platform
 * client, which already maps gateway/HTML/network failures to Persian copy.
 */
export function LoadError({ message, onRetry, className = '' }) {
  return <div role="alert" className={'rounded-surface border border-neutral-200 p-surface text-center ' + className}><p className="text-destructive">{message || 'بارگذاری انجام نشد. لطفاً دوباره تلاش کنید.'}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-3 min-h-11 rounded-control border border-neutral-300 px-5 text-sm font-bold">تلاش دوباره</button>}</div>;
}

/**
 * Product specifications from `product.attributeList` (getProduct resolves
 * [{ key, label, value }] with Persian labels). Never Object.entries(product.attributes).
 */
export function AttributeList({ items = [], title = 'مشخصات' }) {
  const rows = (items || []).filter((row) => row && row.value != null && row.value !== '');
  if (!rows.length) return null;
  return <section aria-label={title} className="mt-6"><h2 className="font-bold">{title}</h2><dl className="mt-3 divide-y divide-neutral-200 text-sm">{rows.map((row) => <div key={row.key} className="flex justify-between gap-4 py-2"><dt className="text-muted">{row.label || row.key}</dt><dd className="font-medium">{Array.isArray(row.value) ? row.value.join('، ') : String(row.value)}</dd></div>)}</dl></section>;
}


export function ProductGallery({ images = [], title = '' }) {
  const safe = images.filter(Boolean);
  const [active, setActive] = useState(0);
  if (!safe.length) return <div className="grid aspect-square place-items-center rounded-2xl bg-neutral-100 text-muted">تصویری ثبت نشده است</div>;
  return <div><img src={safe[active]} alt={title} className="aspect-square w-full rounded-2xl bg-neutral-100 object-cover" /><div className="mt-3 flex gap-2 overflow-x-auto pb-2">{safe.map((image, index) => <button key={image} type="button" onClick={() => setActive(index)} aria-label={`تصویر ${index + 1}`} aria-current={index === active} className={`shrink-0 rounded-xl border-2 ${index === active ? 'border-brand-600' : 'border-transparent'}`}><img src={image} alt="" className="size-20 rounded-lg object-cover" /></button>)}</div></div>;
}

export function Breadcrumbs({ items = [] }) {
  return <nav aria-label="مسیر صفحه" className="text-sm text-muted"><ol className="flex flex-wrap gap-2">{items.map((item, index) => <li key={item.label} className="flex gap-2">{item.href ? <Link to={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}{index < items.length - 1 && <span aria-hidden>/</span>}</li>)}</ol></nav>;
}

