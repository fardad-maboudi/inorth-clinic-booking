import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatIranianMobile } from '@/api/auth';
import {
  forgotAdminPassword,
  loginAdminWithPassword,
  requestAdminOtp,
  resetAdminPassword,
  verifyAdminOtp,
} from '@/api/plugins/auth';
import { Logo } from '@/components/site/ui';
import { AlertCircle, CheckCircle2, ChevronRight, Lock, Phone, RefreshCw, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('otp'); // 'otp' | 'password' | 'reset'
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function switchMode(next) {
    setMode(next);
    setSent(false);
    setOtp('');
    setPassword('');
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'password') {
        await loginAdminWithPassword(phone, password);
        navigate('/admin', { replace: true });
      } else if (mode === 'reset') {
        if (!sent) {
          await forgotAdminPassword(phone);
          setSent(true);
        } else {
          await resetAdminPassword(phone, otp, password);
          switchMode('password');
          setError('رمز عبور جدید با موفقیت ثبت شد. اکنون وارد شوید.');
        }
      } else if (!sent) {
        await requestAdminOtp(phone);
        setSent(true);
      } else {
        await verifyAdminOtp(phone, otp);
        navigate('/admin', { replace: true });
      }
    } catch (cause) {
      setError(cause?.message || 'درخواست انجام نشد. لطفاً اطلاعات را بررسی نمایید.');
    } finally {
      setBusy(false);
    }
  }

  const isSuccessMsg = error.startsWith('رمز عبور جدید با موفقیت');

  return (
    <main id="main" dir="rtl" className="cl-admin-login-bg">
      <div className="w-full max-w-md">
        {/* Back to Public Site */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--cl-muted)] transition-colors hover:text-[var(--cl-teal)]"
          >
            <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
            <span>بازگشت به سایت کلینیک</span>
          </Link>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--cl-teal)] bg-[var(--cl-teal-soft)] border border-[var(--color-brand-200)] px-2.5 py-1 rounded-full">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>بخش مدیریت</span>
          </span>
        </div>

        {/* Card */}
        <div className="cl-card p-6 sm:p-8 shadow-md border-[var(--cl-line)]">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--cl-teal-soft)] border border-[var(--color-brand-100)] text-[var(--cl-teal)] mb-3">
              <Logo size={36} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--cl-ink)]">
              {mode === 'reset' ? 'بازیابی رمز عبور مدیر' : 'ورود به پنل مدیریت'}
            </h1>
            <p className="mt-1 text-sm text-[var(--cl-muted)]">
              کلینیک تخصصی پوست، لیزر و زیبایی نیلوفر
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'reset' && (
            <div className="cl-filters mb-6 grid grid-cols-2 gap-2" role="group" aria-label="روش ورود">
              <button
                type="button"
                aria-pressed={mode === 'otp'}
                onClick={() => switchMode('otp')}
                className={`cl-pill w-full flex items-center justify-center gap-2 ${mode === 'otp' ? 'on' : ''}`}
              >
                <Phone size={16} aria-hidden="true" />
                <span>ورود با پیامک</span>
              </button>
              <button
                type="button"
                aria-pressed={mode === 'password'}
                onClick={() => switchMode('password')}
                className={`cl-pill w-full flex items-center justify-center gap-2 ${mode === 'password' ? 'on' : ''}`}
              >
                <Lock size={16} aria-hidden="true" />
                <span>ورود با رمز عبور</span>
              </button>
            </div>
          )}

          {/* Alert Message */}
          {error && (
            <div
              role={isSuccessMsg ? 'status' : 'alert'}
              className={`mb-5 flex items-start gap-3 rounded-xl p-3.5 text-sm ${
                isSuccessMsg
                  ? 'bg-[#e6f6ea] border border-[#a7f3d0] text-[var(--color-state-success-ink)]'
                  : 'bg-[#fff1f1] border border-[#f1c5c7] text-[var(--color-state-error-ink)]'
              }`}
            >
              {isSuccessMsg ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              )}
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            <div className="cl-field">
              <label htmlFor="admin-phone" className="text-sm font-semibold text-[var(--cl-ink)]">
                شماره همراه مدیر
              </label>
              <input
                id="admin-phone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                disabled={sent || busy}
                value={phone}
                onChange={(event) => setPhone(formatIranianMobile(event.target.value))}
                className="w-full text-left font-mono tracking-wider"
                dir="ltr"
              />
              {sent && (
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-1 text-xs text-[var(--cl-teal)] hover:underline self-start font-medium"
                >
                  ویرایش شماره همراه
                </button>
              )}
            </div>

            {sent && (
              <div className="cl-field">
                <div className="flex items-center justify-between">
                  <label htmlFor="admin-otp" className="text-sm font-semibold text-[var(--cl-ink)]">
                    کد تأیید ۶ رقمی
                  </label>
                  <span className="text-xs text-[var(--cl-muted)]">پیامک‌شده به شماره شما</span>
                </div>
                <input
                  id="admin-otp"
                  required
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="— — — — — —"
                  minLength={6}
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  className="cl-otp w-full font-mono text-xl tracking-[0.35em]"
                  style={{ textAlign: 'center', textIndent: '0.35em' }}
                  dir="ltr"
                  autoFocus
                />
              </div>
            )}

            {(mode === 'password' || (mode === 'reset' && sent)) && (
              <div className="cl-field">
                <label htmlFor="admin-password" className="text-sm font-semibold text-[var(--cl-ink)]">
                  {mode === 'reset' ? 'رمز عبور جدید' : 'رمز عبور'}
                </label>
                <input
                  id="admin-password"
                  required
                  type="password"
                  autoComplete={mode === 'reset' ? 'new-password' : 'current-password'}
                  minLength={6}
                  placeholder="حداقل ۶ کاراکتر"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full text-left font-mono"
                  dir="ltr"
                />
              </div>
            )}

            {mode === 'reset' && sent && (
              <p className="text-xs text-[var(--cl-muted)] leading-relaxed bg-[var(--cl-teal-soft)] p-2.5 rounded-lg border border-[var(--color-brand-100)]">
                کد ارسال‌شده به تلفن همراه و رمز عبور جدید مورد نظر خود را وارد کنید.
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="cl-btn cl-btn-primary cl-btn-block cl-btn-lg mt-2"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw size={18} className="animate-spin" aria-hidden="true" />
                  <span>لطفاً صبر کنید…</span>
                </span>
              ) : mode === 'password' ? (
                'ورود با رمز عبور'
              ) : mode === 'reset' ? (
                sent ? (
                  'ثبت رمز جدید و ورود'
                ) : (
                  'دریافت کد بازیابی'
                )
              ) : sent ? (
                'تأیید و ورود به پنل'
              ) : (
                'دریافت کد ورود'
              )}
            </button>

            {/* Mode Alternator / Forgot Password */}
            <div className="pt-2 text-center">
              {mode !== 'reset' ? (
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-xs font-medium text-[var(--cl-muted)] hover:text-[var(--cl-teal)] transition-colors hover:underline"
                >
                  فراموشی یا تنظیم رمز عبور
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  className="text-xs font-medium text-[var(--cl-teal)] hover:underline"
                >
                  بازگشت به صفحه ورود
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <p className="mt-4 text-center text-xs text-[var(--cl-muted)] opacity-80">
          دسترسی به این بخش منحصراً برای پزشکان و کارکنان مجاز کلینیک نیلوفر مجاز است.
        </p>
      </div>
    </main>
  );
}
