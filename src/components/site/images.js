const SERVICE_IMAGES = {
  skin: '/images/skincare-facial-care.jpg',
  laser: '/images/skin-laser-care.jpg',
  wellness: '/images/spa-massage-care.jpg',
};

function normalizeLabel(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .toLocaleLowerCase();
}

/** Prefer a real catalog image; otherwise use an editorial image by service type. */
export function serviceImageFor(service) {
  if (typeof service?.image === 'string' && service.image.trim()) return service.image.trim();

  const label = normalizeLabel(`${service?.group || ''} ${service?.name || ''} ${service?.description || ''}`);
  if (/لیزر|laser|موهای زائد|رفع مو/.test(label)) return SERVICE_IMAGES.laser;
  if (/ماساژ|اسپا|ریلکسیشن|آرامش|ماساژ درمانی/.test(label)) return SERVICE_IMAGES.wellness;
  return SERVICE_IMAGES.skin;
}

/**
 * Resource avatars are the only images presented as a specialist's own portrait.
 * When none is supplied, use a contextual treatment image and label it as such.
 */
export function staffImageFor(person, services = []) {
  const portrait = person?.avatar || person?.image;
  if (typeof portrait === 'string' && portrait.trim()) return { src: portrait.trim(), isPortrait: true };
  const service = services[0];
  return {
    src: service ? serviceImageFor(service) : '/images/clinic-team-consultation.jpg',
    isPortrait: false,
  };
}
