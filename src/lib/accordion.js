/**
 * Smooth accordion animation for <details> elements across all browsers and pages.
 * Supports native CSS `::details-content` when available (Chrome 131+), and provides
 * a seamless Web Animations API (WAAPI) fallback for other browsers (Safari, Firefox, etc.).
 */
export function installAccordionAnimation() {
  if (typeof document === 'undefined') return;

  const supportsNativeDetailsContent =
    typeof window !== 'undefined' &&
    window.CSS &&
    typeof window.CSS.supports === 'function' &&
    window.CSS.supports('interpolate-size', 'allow-keywords') &&
    window.CSS.supports('selector(::details-content)');

  document.addEventListener('click', (event) => {
    if (event.detail !== 0) return;
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const summary = target?.closest('.cl-faq details summary');
    const details = summary?.parentElement;
    if (!details || details.tagName !== 'DETAILS') return;

    details.setAttribute('data-instant-toggle', '');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => details.removeAttribute('data-instant-toggle'));
    });
  });

  if (supportsNativeDetailsContent) return;

  document.addEventListener('click', (event) => {
    if (event.detail === 0) return;
    // Target any summary inside .cl-faq details, details.cl-accordion, or details.cl-card
    const summary = event.target.closest('.cl-faq details summary, details.cl-accordion summary, details.cl-card summary');
    if (!summary) return;

    const details = summary.parentElement;
    if (!details || details.tagName !== 'DETAILS') return;

    // Respect reduced motion accessibility setting
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      return;
    }

    // Ignore clicks on nested links/buttons inside the summary
    if (event.target !== summary && event.target.closest('a, button, input')) {
      return;
    }

    event.preventDefault();

    if (details._accordionAnim) {
      details._accordionAnim.cancel();
      details._accordionAnim = null;
    }

    const isClosing = details.open && !details._isExpanding;

    if (isClosing) {
      details._isClosing = true;
      details._isExpanding = false;

      const startHeight = details.offsetHeight;
      const detailsStyle = window.getComputedStyle(details);
      const borderTop = parseFloat(detailsStyle.borderTopWidth) || 0;
      const borderBottom = parseFloat(detailsStyle.borderBottomWidth) || 0;
      const endHeight = summary.offsetHeight + borderTop + borderBottom;

      details.style.overflow = 'hidden';
      const anim = details.animate(
        [
          { height: `${startHeight}px`, opacity: 1 },
          { height: `${endHeight}px`, opacity: 0.95 }
        ],
        {
          duration: 220,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
      );

      details._accordionAnim = anim;
      anim.onfinish = () => {
        details.open = false;
        details._isClosing = false;
        details._accordionAnim = null;
        details.style.overflow = '';
        details.style.height = '';
      };
      anim.oncancel = () => {
        details._isClosing = false;
        details._accordionAnim = null;
        details.style.overflow = '';
        details.style.height = '';
      };
    } else {
      details._isExpanding = true;
      details._isClosing = false;

      const detailsStyle = window.getComputedStyle(details);
      const borderTop = parseFloat(detailsStyle.borderTopWidth) || 0;
      const borderBottom = parseFloat(detailsStyle.borderBottomWidth) || 0;
      const startHeight = summary.offsetHeight + borderTop + borderBottom;

      details.open = true;
      const endHeight = details.offsetHeight;

      details.style.overflow = 'hidden';
      const anim = details.animate(
        [
          { height: `${startHeight}px` },
          { height: `${endHeight}px` }
        ],
        {
          duration: 220,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
        }
      );

      details._accordionAnim = anim;
      anim.onfinish = () => {
        details._isExpanding = false;
        details._accordionAnim = null;
        details.style.overflow = '';
        details.style.height = '';
      };
      anim.oncancel = () => {
        details._isExpanding = false;
        details._accordionAnim = null;
        details.style.overflow = '';
        details.style.height = '';
      };
    }
  });
}
