import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthToken, logout } from '@/api/plugins/auth';
import NotificationBell from '@/components/notifications/NotificationBell';
import { siteConfig } from '@/config/site';
import { Logo } from '@/components/site/ui';
import { announceAuthChange, useSession } from '@/components/site/hooks';

const NAV = [
  ['/', 'خانه', true],
  ['/services', 'خدمات'],
  ['/team', 'تیم متخصصان'],
  ['/packages', 'بسته‌ها'],
  ['/faq', 'پرسش‌های متداول'],
  ['/contact', 'تماس'],
];

export default function Layout({ children }) {
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const root = useRef(null);

  // Scroll reveals: transform/opacity only, one observer, never blocks interaction.
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );
    let timer = 0;
    const scan = () => {
      el.querySelectorAll('.cl-rv:not(.in)').forEach((n) => io.observe(n));
      // failsafe for throttled/background tabs: whatever is on screen shows up
      clearTimeout(timer);
      timer = setTimeout(() => el.querySelectorAll('.cl-rv:not(.in)').forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) n.classList.add('in');
      }), 700);
    };
    el.setAttribute('data-js', '');
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  async function signOut() {
    try {
      await logout();
    } catch {
      /* the local session is cleared below regardless of the server answer */
    }
    clearAuthToken();
    announceAuthChange();
    navigate('/');
  }

  // Admin routes have their own dedicated header and layout.
  // Suppress the shared public header, footer, and mobile CTA strictly on admin routes.
  const isAdminRoute = /^\/admin(\/|$)/.test(pathname);

  if (isAdminRoute) {
    return (
      <div className="cl-app cl-app-admin" dir="rtl" lang="fa" ref={root}>
        <a className="cl-skip" href="#main">رفتن به محتوای اصلی</a>
        {children}
      </div>
    );
  }

  return (
    <div className="cl-app" dir="rtl" lang="fa" ref={root}>
      <a className="cl-skip" href="#main">رفتن به محتوای اصلی</a>
      <header className="cl-header">
        <div className="cl-wrap cl-header-in">
          <Link to="/" className="cl-brand" aria-label={`${siteConfig.name} – صفحهٔ اصلی`}>
            <Logo size={34} />
            <span>{siteConfig.name}</span>
          </Link>

          <button type="button" className="cl-burger" aria-expanded={open} aria-controls="cl-nav" onClick={() => setOpen((o) => !o)}>
            <span className="cl-sr">{open ? 'بستن منو' : 'باز کردن منو'}</span>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <nav id="cl-nav" className={`cl-nav${open ? ' open' : ''}`} aria-label="منوی اصلی" onClick={(e) => e.target.closest?.('a') && setOpen(false)}>
            <ul>
              {NAV.map(([to, label, end]) => (
                <li key={to}>
                  <NavLink to={to} end={!!end} className={({ isActive }) => (isActive ? 'on' : '')}>{label}</NavLink>
                </li>
              ))}
            </ul>
            <div className="cl-nav-actions">
              {loading ? null : user ? (
                <>
                  <NotificationBell />
                  <Link className="cl-btn cl-btn-outline" to="/client">حساب من</Link>
                  <button type="button" className="cl-btn cl-btn-ghost" onClick={signOut}>خروج</button>
                </>
              ) : (
                <Link className="cl-btn cl-btn-outline" to="/auth/login">ورود</Link>
              )}
              <Link className="cl-btn cl-btn-primary" to="/book">رزرو نوبت</Link>
            </div>
          </nav>
        </div>
      </header>

      <main id="main" key={pathname} className="cl-main cl-page" tabIndex={-1}>{children}</main>

      {/^\/(book|auth)/.test(pathname) ? null : (
        <div className="cl-mcta"><Link className="cl-btn cl-btn-primary" to="/book">رزرو نوبت</Link></div>
      )}

      <footer className={`cl-footer${/^\/packages/.test(pathname) ? ' mt-0' : ''}`}>
        <div className="cl-wrap cl-footer-in">
          <div>
            <p className="cl-brand cl-brand-foot">
              <Logo size={26} />
              <span>{siteConfig.name}</span>
            </p>
            <p className="cl-footer-note">{siteConfig.tagline}</p>
          </div>
          <div>
            <h2>ساعت کاری</h2>
            <ul className="cl-hours">
              {siteConfig.hours.map(([d, h]) => (
                <li key={d}><span>{d}</span><span>{h}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h2>نشانی و ارتباط</h2>
            <address>
              <p>{siteConfig.address}</p>
              <p><a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, '')}`} dir="ltr">{siteConfig.phone}</a></p>
            </address>
          </div>
          <div>
            <h2>پشتیبانی</h2>
            <ul className="cl-links">
              <li><Link to="/telegram/subscribe">یادآور نوبت در تلگرام</Link></li>
              <li><Link to="/support/tickets">ارسال درخواست به پشتیبانی</Link></li>
              <li><Link to="/client">پیگیری نوبت‌ها</Link></li>
            </ul>
          </div>
        </div>
        <div className="cl-wrap"><p className="cl-copy">تمامی حقوق برای {siteConfig.name} محفوظ است.</p></div>
      </footer>
    </div>
  );
}
