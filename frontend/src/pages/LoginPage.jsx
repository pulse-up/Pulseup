import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../api/api';
import AuthBackground from '../components/AuthBackground';
import ResponsiveHeader from '../components/ResponsiveHeader';

import './LoginPage.css';

const INITIAL_FORM = {
  email: '',
  password: '',
};

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function EyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.5" />

      {visible && <path d="M4 4 20 20" />}
    </svg>
  );
}

function normalizeRole(role) {
  return String(role || '')
    .trim()
    .toUpperCase()
    .replace('ROLE_', '');
}

function getDashboardPath(role) {
  switch (normalizeRole(role)) {
    case 'STUDENT':
      return '/student/dashboard';

    case 'EMPLOYEE':
      return '/employee/dashboard';

    case 'STAFF':
      return '/staff/dashboard';

    case 'ADMIN':
      return '/admin/dashboard';

    default:
      return '/login';
  }
}

function getLoginData(response) {
  const responseData = response?.data || {};

  const nestedUser =
    responseData.user && typeof responseData.user === 'object'
      ? responseData.user
      : {};

  const token =
    responseData.token ||
    responseData.accessToken ||
    responseData.jwt ||
    nestedUser.token ||
    nestedUser.accessToken ||
    nestedUser.jwt ||
    '';

  const role = normalizeRole(
    responseData.role ||
      responseData.userRole ||
      nestedUser.role ||
      nestedUser.userRole,
  );

  const userId =
    responseData.userId ??
    responseData.id ??
    nestedUser.userId ??
    nestedUser.id ??
    null;

  return {
    ...nestedUser,
    ...responseData,
    userId,
    token,
    role,
  };
}

function getLoginError(error) {
  if (!error.response) {
    return (
      'Could not connect to the PulseUp backend. ' +
      'Make sure Spring Boot is running on port 8080.'
    );
  }

  const responseData = error.response.data;

  const serverMessage =
    typeof responseData === 'string'
      ? responseData
      : responseData?.message || responseData?.error;

  switch (error.response.status) {
    case 400:
      return serverMessage || 'Enter a valid email address and password.';

    case 401:
      return serverMessage || 'The email address or password is incorrect.';

    case 403:
      return (
        serverMessage ||
        'This account is inactive or is not allowed to sign in.'
      );

    case 404:
      return (
        serverMessage || 'No PulseUp account was found for this email address.'
      );

    default:
      if (error.response.status >= 500) {
        return (
          serverMessage ||
          'The server could not complete your sign-in. Check the backend console.'
        );
      }

      return serverMessage || 'Sign-in could not be completed.';
  }
}

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendNotice, setResendNotice] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('pulseupUser');

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      const token =
        parsedUser.token || parsedUser.accessToken || parsedUser.jwt || '';

      const dashboardPath = getDashboardPath(parsedUser.role);

      if (token && dashboardPath !== '/login') {
        navigate(dashboardPath, {
          replace: true,
        });
      }
    } catch (error) {
      console.error('Could not read stored PulseUp user:', error);
      localStorage.removeItem('pulseupUser');
    }
  }, [navigate]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setMessage('');
    setNeedsVerification(false);
    setResendNotice('');
  }

  async function handleResendVerification() {
    if (isResending) {
      return;
    }

    setIsResending(true);
    setResendNotice('');

    try {
      await api.post('/auth/resend-verification', {
        email: form.email.trim().toLowerCase(),
      });

      setResendNotice('A new verification email is on its way.');
    } catch (error) {
      console.error('Resend verification failed:', error);

      setResendNotice('We could not send the email. Please try again shortly.');
    } finally {
      setIsResending(false);
    }
  }

  function validateForm() {
    if (!form.email.trim() || !form.password) {
      return 'Enter your email address and password.';
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(form.email.trim())) {
      return 'Enter a valid email address.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setMessage('');
    setNeedsVerification(false);
    setResendNotice('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const authenticatedUser = getLoginData(response);

      if (!authenticatedUser.token) {
        throw new Error('LOGIN_TOKEN_MISSING');
      }

      if (!authenticatedUser.role) {
        throw new Error('LOGIN_ROLE_MISSING');
      }

      const dashboardPath = getDashboardPath(authenticatedUser.role);

      if (dashboardPath === '/login') {
        throw new Error('UNSUPPORTED_ROLE');
      }

      localStorage.setItem('pulseupUser', JSON.stringify(authenticatedUser));

      navigate(dashboardPath, {
        replace: true,
      });
    } catch (error) {
      console.error(
        'PulseUp login failed:',
        error.response?.status,
        error.response?.data || error.message,
      );

      localStorage.removeItem('pulseupUser');

      if (error.message === 'LOGIN_TOKEN_MISSING') {
        setMessage(
          'The backend accepted the login but did not return an authentication token.',
        );
      } else if (error.message === 'LOGIN_ROLE_MISSING') {
        setMessage(
          'The backend accepted the login but did not return the account role.',
        );
      } else if (error.message === 'UNSUPPORTED_ROLE') {
        setMessage('The account has an unsupported role.');
      } else if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setMessage(
          'Please verify your email address before signing in. Check your inbox for the verification link.',
        );
        setNeedsVerification(true);
      } else {
        setMessage(getLoginError(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="pulse-auth-page pulse-login-page">
      <AuthBackground />

      <section
        className="pulse-auth-card pulse-login-card"
        aria-label="PulseUp account sign in"
      >
        <ResponsiveHeader
          variant="auth"
          ariaLabel="Sign-in page navigation"
          desktopAction={{ label: 'Back to home', to: '/' }}
          menuItems={[
            { label: 'Home', to: '/' },
            { label: 'Sign in', to: '/login', active: true },
            { label: 'Create student account', to: '/register' },
          ]}
        />

        <div className="pulse-login-content">
          <div className="pulse-login-heading">
            <h1 className="pulse-auth-title">Sign in</h1>

            <span className="pulse-auth-lead">
              Enter your email and password to continue.
            </span>
          </div>

          <form className="pulse-login-form" onSubmit={handleSubmit}>
            <label className="pulse-auth-field pulse-login-field">
              <span>Email address</span>

              <div className="pulse-login-input-wrapper">
                <i>
                  <MailIcon />
                </i>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                  required
                  autoFocus
                />
              </div>
            </label>

            <label className="pulse-auth-field pulse-login-field">
              <span>Password</span>

              <div className="pulse-login-input-wrapper">
                <i>
                  <LockIcon />
                </i>

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  required
                />

                <button
                  type="button"
                  className="pulse-login-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  disabled={isSubmitting}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </label>

            {message && (
              <p className="pulse-auth-message" role="alert">
                {message}
              </p>
            )}

            {needsVerification && (
              <div className="pulse-login-resend">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </button>

                {resendNotice && <small>{resendNotice}</small>}
              </div>
            )}


            <button
              type="submit"
              className="pulse-auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="pulse-login-divider">
            <span>Don't have an account?</span>
          </div>

          <Link className="pulse-login-register" to="/register">
            Create a student account
          </Link>

          <p className="pulse-login-support">
            Staff and administrators use the same sign-in form.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
