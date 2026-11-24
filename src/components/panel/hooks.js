import { useSyncExternalStore } from 'react';

const query = '(min-width: 768px)';
const subscribe = (cb) => {
  const mq = window.matchMedia(query);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
/** True from the `md` breakpoint up; drives drawer side (left panel vs bottom sheet). */
export const useIsDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );

/** The calendar endpoint answers `{ slots, bookings }`, plain or wrapped in `data`. */
export const unwrapCalendar = (result) => {
  const body = result?.data && !Array.isArray(result.data) ? result.data : result;
  return { slots: Array.from(body?.slots || []), bookings: Array.from(body?.bookings || []) };
};
