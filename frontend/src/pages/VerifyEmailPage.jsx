import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import api from '../api/api';
import AuthBackground from '../components/AuthBackground';
import ResponsiveHeader from '../components/ResponsiveHeader';

import './VerifyEmailPage.css';

function StatusIcon({ kind }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {kind === 'success' ? (
        <path d="m6 12.5 4 4 8-9" />
      ) : (
        <>
          <path d="M12 7v6" />
          <path d="M12 17h.01" />
        </>
      )}
    </svg>
  );
}

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  // status: verifying | success | expired | invalid | error
  const [status, setStatus] = useState(token ? 'verifying' : 'invalid');
  const [resendEmail, setResendEmail] = useState('');
  const [resendNotice, setResendNotice] = useState('');
  const [isResending, setIsResending] = useState(false);

  // React StrictMode runs effects twice in development. A token can only
  // be used once, so guard against sending it a second time.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!token || hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    api
      .post('/auth/verify-email', { token })
      .then(() => {
        sessionStorage.removeItem('pulseupPendingEmail');
        setStatus('success');
      })
      .catch((error) => {
        const responseStatus = error.response?.status;

        if (responseStatus === 410) {
          setStatus('expired');
        } else if (responseStatus === 400) {
          setStatus('invalid');
        } else {
          setStatus('error');
        }
      });
  }, [token]);

  async function handleResend(event) {
    event.preventDefault();

    if (!resendEmail.trim() || isResending) {
      return;
    }

    setIsResending(true);
    setResendNotice('');

    try {
      await api.post('/auth/resend-verification', {
        email: resendEmail.trim().toLowerCase(),
      });

      setResendNotice(
        'If that address has an unverified account, a new link is on its way.',
      );
    } catch (error) {
      console.error('Resend verification failed:', error);

      setResendNotice('We could not send the email. Please try again shortly.');
    } finally {
      setIsResending(false);
    }
  }

  const canResend = status === 'expired' || status === 'invalid';

  const content = {
    verifying: {
      title: 'Verifying your email',
      text: 'Please wait a moment...',
    },
    success: {
      title: 'Email verified',
      text: 'Your account is active. You can now sign in.',
    },
    expired: {
      title: 'Link expired',
      text: 'This verification link has expired. Request a new one below.',
    },
    invalid: {
      title: 'Link not valid',
      text: 'This link is invalid or has already been used. If you already verified your email, just sign in. Otherwise request a new link.',
    },
    error: {
      title: 'Something went wrong',
      text: 'We could not reach the server. Please try again in a moment.',
    },
  }[status];

  return (
    <main className="pulse-auth-page pulse-verify-page">
      <AuthBackground />

      <section className="pulse-auth-card pulse-verify-card" aria-live="polite">
        <ResponsiveHeader
          variant="auth"
          ariaLabel="Email verification navigation"
          desktopAction={{ label: 'Back to home', to: '/' }}
          menuItems={[
            { label: 'Home', to: '/' },
            { label: 'Sign in', to: '/login' },
          ]}
        />

        <div className="pulse-verify-content">
          {status === 'verifying' ? (
            <span className="pulse-verify-icon">
              <span className="pulse-verify-spinner" />
            </span>
          ) : (
            <span
              className={
                status === 'success'
                  ? 'pulse-verify-icon is-success'
                  : 'pulse-verify-icon is-error'
              }
            >
              <StatusIcon kind={status === 'success' ? 'success' : 'error'} />
            </span>
          )}

          <h1 className="pulse-auth-title">{content.title}</h1>

          <p className="pulse-auth-lead">{content.text}</p>

          {canResend && (
            <form className="pulse-verify-form" onSubmit={handleResend}>
              <label className="pulse-auth-field">
                <span>Email address</span>

                <input
                  type="email"
                  value={resendEmail}
                  onChange={(event) => setResendEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isResending}
                  required
                />
              </label>

              <button
                type="submit"
                className="pulse-verify-secondary"
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Send a new link'}
              </button>

              {resendNotice && (
                <p className="pulse-verify-note">{resendNotice}</p>
              )}
            </form>
          )}

          {status !== 'verifying' && (
            <div className="pulse-verify-actions">
              <Link className="pulse-auth-submit" to="/login">
                Go to sign in
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default VerifyEmailPage;
