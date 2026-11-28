const SERVICE_IMAGES = {
  skin: [
    '/images/skincare-facial-care.avif',
    '/images/skincare-consultation.avif',
  ],
  laser: [
    '/images/skin-laser-care.avif',
    '/images/laser-hair-removal.avif',
  ],
  wellness: [
    '/images/spa-massage-care.avif',
    '/images/spa-aromatherapy-care.avif',
  ],
};

const DEFAULT_STAFF_IMAGES = [
  '/images/clinic-team-consultation.avif',
  '/images/skincare-consultation.avif',
];

function normalizeLabel(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .toLocaleLowerCase();
}

function categoryFor(service) {
  const label = normalizeLabel(`${service?.group || ''} ${service?.name || ''} ${service?.description || ''}`);
  if (/لیزر|laser|موهای زائد|رفع مو/.test(label)) return 'laser';
  if (/ماساژ|اسپا|ریلکسیشن|آرامش|ماساژ درمانی/.test(label)) return 'wellness';
  return 'skin';
}

function imageFor(images, identity) {
  const key = normalizeLabel(identity);
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return images[(hash >>> 0) % images.length];
}

function serviceImagesFor(service) {
  return SERVICE_IMAGES[categoryFor(service)];
}

function serviceIdentity(service) {
  return service?.id ?? service?._id ?? service?.slug ?? service?.name ?? service?.description ?? '';
}

/** Prefer a catalog image; otherwise assign a stable, category-appropriate editorial image. */
export function serviceImageFor(service) {
  if (typeof service?.image === 'string' && service.image.trim()) return service.image.trim();

  const images = serviceImagesFor(service);
  return imageFor(images, `${categoryFor(service)}:${serviceIdentity(service)}`);
}

/**
 * Resource avatars are the only images presented as a specialist's own portrait.
 * Without a portrait, choose a stable treatment image rather than implying identity.
 */
export function staffImageFor(person, services = []) {
  const portrait = person?.avatar || person?.image;
  if (typeof portrait === 'string' && portrait.trim()) return { src: portrait.trim(), isPortrait: true };

  const service = services[0];
  const images = service ? serviceImagesFor(service) : DEFAULT_STAFF_IMAGES;
  const identity = person?.id ?? person?._id ?? person?.slug ?? person?.name ?? 'clinic';
  const category = service ? categoryFor(service) : 'team';
  return {
    src: imageFor(images, `${category}:${identity}`),
    isPortrait: false,
  };
}
