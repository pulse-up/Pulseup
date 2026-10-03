import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import api from '../api/api';
import AuthBackground from '../components/AuthBackground';
import ResponsiveHeader from '../components/ResponsiveHeader';

import './VerifyEmailPage.css';

const RESEND_COOLDOWN_SECONDS = 60;
const PENDING_EMAIL_KEY = 'pulseupPendingEmail';

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function CheckEmailPage() {
  const location = useLocation();

  // The address arrives via router state after registering; sessionStorage
  // keeps it if the page is refreshed.
  const [email] = useState(
    () =>
      location.state?.email || sessionStorage.getItem(PENDING_EMAIL_KEY) || '',
  );

  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(
      () => setSecondsLeft((current) => current - 1),
      1000,
    );

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  async function handleResend() {
    if (!email || secondsLeft > 0 || isSending) {
      return;
    }

    setIsSending(true);
    setNotice('');
    setError('');

    try {
      await api.post('/auth/resend-verification', { email });

      setNotice('A new verification email is on its way.');
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (requestError) {
      console.error('Resend verification failed:', requestError);

      setError('We could not resend the email. Please try again shortly.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="pulse-auth-page pulse-verify-page">
      <AuthBackground />

      <section className="pulse-auth-card pulse-verify-card" aria-live="polite">
        <ResponsiveHeader
          variant="auth"
          ariaLabel="Verification page navigation"
          desktopAction={{ label: 'Back to home', to: '/' }}
          menuItems={[
            { label: 'Home', to: '/' },
            { label: 'Sign in', to: '/login' },
          ]}
        />

        <div className="pulse-verify-content">
          <span className="pulse-verify-icon">
            <MailIcon />
          </span>

          <h1 className="pulse-auth-title">Check your email</h1>

          {email ? (
            <p className="pulse-auth-lead">
              We sent a verification link to{' '}
              <span className="pulse-verify-email">{email}</span>. Click it to
              activate your account.
            </p>
          ) : (
            <p className="pulse-auth-lead">
              We sent you a verification link. Click it to activate your
              account.
            </p>
          )}

          {notice && <p className="pulse-verify-note">{notice}</p>}

          {error && (
            <p className="pulse-auth-message" role="alert">
              {error}
            </p>
          )}

          <div className="pulse-verify-actions">
            {email && (
              <button
                type="button"
                className="pulse-verify-secondary"
                onClick={handleResend}
                disabled={secondsLeft > 0 || isSending}
              >
                {isSending
                  ? 'Sending...'
                  : secondsLeft > 0
                    ? `Resend email in ${secondsLeft}s`
                    : 'Resend email'}
              </button>
            )}

            <Link className="pulse-auth-submit" to="/login">
              Go to sign in
            </Link>
          </div>

          <p className="pulse-verify-hint">
            Can&apos;t find it? Check your spam folder. The link expires after
            24 hours.
          </p>
        </div>
      </section>
    </main>
  );
}

export default CheckEmailPage;
