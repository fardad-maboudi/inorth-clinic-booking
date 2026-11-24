/**
 * iOS Safari viewport recovery — platform-owned, installed once from main.jsx.
 *
 * Failure it prevents: focusing a form field (login, checkout, search) opens
 * the keyboard and iOS pans the *visual* viewport. When the keyboard closes
 * (or a client-side navigation replaces the screen) the pan can stay, so the
 * sticky header / top of the page is scrolled out of view until the user
 * pinch-zooms. `window.scrollY` is still 0, which is why `scrollTo(0, 0)`
 * alone does nothing: the layout viewport never moved.
 *
 * Fix: after a field loses focus and no other field has it, watch the visual
 * viewport for a short, bounded window and, if it is displaced, jiggle the
 * layout scroll by 1px and put it back. The user's own scroll position is
 * preserved, and a pinch-zoomed viewport is never touched.
 *
 * The same focus also scrolls `overflow: hidden` ancestors (an app shell with
 * `h-dvh overflow-hidden` is still a programmatic scroll container), shifting
 * the whole shell up with a blank strip below. Those ancestors are reset too.
 * Prefer `overflow: clip` (Tailwind `overflow-clip`) on full-height shells: it
 * cannot be scrolled at all.
 *
 * Pages that sign in and then swap the whole screen can also call
 * `recoverViewport()` after navigating.
 */
const RECOVERY_WINDOW_MS = 800;
const RETRY_DELAYS_MS = [120, 320, 600];
const FIELD = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

function fieldFocused() {
  return Boolean(document.activeElement?.matches?.(FIELD));
}

// Scroll containers that wrapped the last field; offset only by focus, never by users.
let shells = [];

function collectShells(field) {
  const found = [];
  for (let el = field?.parentElement; el; el = el.parentElement) {
    const { overflowX, overflowY } = window.getComputedStyle(el);
    if (overflowX === 'hidden' || overflowY === 'hidden') found.push(el);
  }
  shells = found;
}

function realign() {
  const viewport = window.visualViewport;
  if (!viewport || fieldFocused()) return;
  for (const el of shells) {
    if (el.scrollTop !== 0) el.scrollTop = 0;
    if (el.scrollLeft !== 0) el.scrollLeft = 0;
  }
  // Never move the viewport while the user is deliberately pinch-zoomed.
  if (Math.abs(viewport.scale - 1) > 0.01) return;
  if (viewport.offsetTop <= 0 && viewport.offsetLeft === 0) return;
  const { scrollX, scrollY } = window;
  // The site uses smooth scrolling globally; this correction must not animate.
  window.scrollTo({ top: scrollY + 1, left: scrollX, behavior: 'instant' });
  window.scrollTo({ top: scrollY, left: scrollX, behavior: 'instant' });
}

/** Bounded, self-cleaning recovery. Returns a cancel function. */
export function recoverViewport() {
  if (typeof window === 'undefined') return () => {};
  const viewport = window.visualViewport;
  realign();
  let frame = window.requestAnimationFrame(() => {
    realign();
    frame = window.requestAnimationFrame(realign);
  });
  const timers = RETRY_DELAYS_MS.map((delay) => window.setTimeout(realign, delay));
  viewport?.addEventListener('resize', realign);
  viewport?.addEventListener('scroll', realign);
  let stopTimer;
  const cancel = () => {
    window.cancelAnimationFrame(frame);
    timers.forEach((id) => window.clearTimeout(id));
    window.clearTimeout(stopTimer);
    viewport?.removeEventListener('resize', realign);
    viewport?.removeEventListener('scroll', realign);
  };
  stopTimer = window.setTimeout(cancel, RECOVERY_WINDOW_MS);
  return cancel;
}

let installed = false;

/** Idempotent: recover whenever a form field loses focus. */
export function installViewportRecovery() {
  if (installed || typeof window === 'undefined' || !window.visualViewport) return;
  installed = true;
  let cancel = () => {};
  document.addEventListener('focusout', (event) => {
    if (!event.target?.matches?.(FIELD)) return;
    cancel();
    collectShells(event.target);
    cancel = recoverViewport();
  });
}
