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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const burgerRef = useRef(null);
  const accountMenuRef = useRef(null);
  const profileTriggerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    if (!open && !accountMenuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (accountMenuOpen) {
        setAccountMenuOpen(false);
        profileTriggerRef.current?.focus();
      }
      if (open) {
        setOpen(false);
        if (!accountMenuOpen) burgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, accountMenuOpen]);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;
    const closeOnOutsidePointer = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setAccountMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    accountMenuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, [accountMenuOpen]);

  async function signOut() {
    try {
      await logout();
    } catch {
      /* the local session is cleared below regardless of the server answer */
    }
    clearAuthToken();
    announceAuthChange();
    setOpen(false);
    setAccountMenuOpen(false);
    navigate('/auth/login');
  }

  function handleAccountMenuKeyDown(event) {
    const items = [...(accountMenuRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];
    if (!items.length) return;

    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex;
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
    else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;
    else return;

    event.preventDefault();
    items[nextIndex]?.focus();
  }

  // Admin routes have their own dedicated header and layout.
  // Suppress the shared public header, footer, and mobile CTA strictly on admin routes.
  const isAdminRoute = /^\/admin(\/|$)/.test(pathname);

  if (isAdminRoute) {
    return (
      <div className="cl-app cl-app-admin" dir="rtl" lang="fa">
        <a className="cl-skip" href="#main">رفتن به محتوای اصلی</a>
        {children}
      </div>
    );
  }

  return (
    <div className="cl-app" dir="rtl" lang="fa">
      <a className="cl-skip" href="#main">رفتن به محتوای اصلی</a>
      <header className="cl-header">
        <div className="cl-wrap cl-header-in">
          <Link to="/" className="cl-brand" aria-label={`${siteConfig.name} – صفحهٔ اصلی`}>
            <Logo size={34} />
            <span className="cl-brand-copy">
              <span>{siteConfig.name}</span>
              <span className="cl-brand-caption">{siteConfig.tagline}</span>
            </span>
          </Link>

          <div className="cl-header-controls">
            <div
              className="cl-account"
              ref={accountMenuRef}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setAccountMenuOpen(false);
              }}
            >
              {loading ? (
                <button
                  type="button"
                  className="cl-profile-trigger"
                  aria-label="در حال بررسی وضعیت حساب کاربری"
                  aria-busy="true"
                  disabled
                >
                  <AccountIcon />
                </button>
              ) : user ? (
                <>
                  <button
                    ref={profileTriggerRef}
                    type="button"
                    className="cl-profile-trigger"
                    aria-label="منوی حساب کاربری"
                    aria-haspopup="menu"
                    aria-expanded={accountMenuOpen}
                    aria-controls="cl-account-menu"
                    onClick={() => setAccountMenuOpen((value) => !value)}
                  >
                    <AccountIcon />
                  </button>
                  {accountMenuOpen ? (
                    <div
                      id="cl-account-menu"
                      className="cl-account-menu"
                      role="menu"
                      aria-label="حساب کاربری"
                      onKeyDown={handleAccountMenuKeyDown}
                    >
                      <Link
                        to="/client"
                        className="cl-account-menu-link"
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        حساب من
                      </Link>
                      <button
                        type="button"
                        className="cl-account-menu-link cl-account-logout"
                        role="menuitem"
                        onClick={signOut}
                      >
                        خروج
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <Link
                  ref={profileTriggerRef}
                  to="/auth/login"
                  className="cl-profile-trigger"
                  aria-label="ورود به حساب کاربری"
                  title="ورود"
                >
                  <AccountIcon />
                </Link>
              )}
            </div>

            <button ref={burgerRef} type="button" className="cl-burger" aria-expanded={open} aria-controls="cl-nav" onClick={() => setOpen((o) => !o)}>
              <span className="cl-sr">{open ? 'بستن منو' : 'باز کردن منو'}</span>
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>

          <nav id="cl-nav" className={`cl-nav${open ? ' open' : ''}`} aria-label="منوی اصلی" onClick={(e) => e.target.closest?.('a') && setOpen(false)}>
            <ul>
              {NAV.map(([to, label, end]) => (
                <li key={to}>
                  <NavLink to={to} end={!!end} className={({ isActive }) => (isActive ? 'on' : '')}>{label}</NavLink>
                </li>
              ))}
            </ul>
            <div className="cl-nav-actions">
              {user ? <NotificationBell /> : null}
              <Link className="cl-btn cl-btn-primary" to="/book">رزرو نوبت</Link>
            </div>
          </nav>
        </div>
      </header>

      <main id="main" key={pathname} className="cl-main" tabIndex={-1}>{children}</main>

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

function AccountIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.8 20c.7-3.7 3.1-5.5 7.2-5.5s6.5 1.8 7.2 5.5" />
    </svg>
  );
}
