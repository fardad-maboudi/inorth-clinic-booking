import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { requestOtp, safeReturnPath, verifyOtp } from '@/api/plugins/auth';
import PasskeySignIn from '@/components/auth/login-extensions/PasskeySignIn';
import { Logo } from '@/components/site/ui';
import { errText, latinDigits, nf, normalizePhone } from '@/components/site/format';
import { announceAuthChange, useTitle } from '@/components/site/hooks';

const RESEND_SECONDS = 60;

export default function LoginPage() {
  useTitle('ورود');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeReturnPath(params.get('next'), '/client');
  const [stage, setStage] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function send(e) {
    e?.preventDefault();
    const p = normalizePhone(phone);
    if (!p) {
      setError('شمارهٔ موبایل معتبر وارد کنید (مثل ۰۹۱۲۱۲۳۴۵۶۷).');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await requestOtp(p);
      setStage('code');
      setCode('');
      setWait(RESEND_SECONDS);
    } catch (err) {
      setError(errText(err, 'ارسال کد انجام نشد. کمی بعد دوباره تلاش کنید.'));
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    const c = latinDigits(code).replace(/\D/g, '');
    if (c.length < 4) {
      setError('کد تأیید را کامل وارد کنید.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await verifyOtp(normalizePhone(phone), c);
      announceAuthChange();
      navigate(next, { replace: true });
    } catch (err) {
      setError(errText(err, 'کد واردشده درست نیست یا منقضی شده است.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cl-wrap cl-section cl-login">
     <div className="cl-auth">
      <aside className="cl-auth-art" aria-hidden="true">
        <h2>نوبت‌های شما، همیشه همراهتان</h2>
        <ul>
          <li>مشاهده و جابه‌جایی نوبت‌ها</li>
          <li>اعتبار بسته‌ها و امتیاز باشگاه</li>
          <li>یادآور پیامکی و تلگرامی</li>
        </ul>
      </aside>
      <div className="cl-card cl-login-card">
        <Logo size={38} />
        <h1>ورود به حساب</h1>
        <p className="cl-muted">
          {stage === 'phone' ? 'شمارهٔ موبایل خود را وارد کنید تا کد تأیید پیامک شود.' : `کد پیامک‌شده به ${normalizePhone(phone).replace(/\d/g, (d) => nf(d))} را وارد کنید.`}
        </p>

        {stage === 'phone' ? (
          <form onSubmit={send} noValidate>
            <label className="cl-field">
              <span>شمارهٔ موبایل</span>
              <input dir="ltr" inputMode="tel" autoComplete="tel" autoFocus placeholder="09121234567" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!error} aria-describedby="login-err" />
            </label>
            {error ? <p id="login-err" className="cl-err cl-alert" role="alert">{error}</p> : null}
            <button className="cl-btn cl-btn-primary cl-btn-block" disabled={busy}>{busy ? 'در حال ارسال…' : 'ارسال کد تأیید'}</button>
          </form>
        ) : (
          <form onSubmit={verify} noValidate>
            <label className="cl-field">
              <span>کد تأیید</span>
              <input className="cl-otp" dir="ltr" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={8} value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!error} aria-describedby="login-err" />
            </label>
            {error ? <p id="login-err" className="cl-err cl-alert" role="alert">{error}</p> : null}
            <button className="cl-btn cl-btn-primary cl-btn-block" disabled={busy}>{busy ? 'در حال بررسی…' : 'ورود'}</button>
            <div className="cl-login-alt">
              <button type="button" className="cl-btn cl-btn-ghost" onClick={() => { setStage('phone'); setError(''); }}>تغییر شماره</button>
              <button type="button" className="cl-btn cl-btn-ghost" onClick={send} disabled={wait > 0 || busy}>
                {wait > 0 ? `ارسال دوباره (${nf(wait)})` : 'ارسال دوباره کد'}
              </button>
            </div>
          </form>
        )}

        {stage === 'phone' ? <PasskeySignIn /> : null}
        <p className="cl-muted cl-small">ورود برای رزرو الزامی نیست؛ <Link to="/book">بدون ورود نوبت بگیرید</Link>.</p>
      </div>
     </div>
    </div>
  );
}
