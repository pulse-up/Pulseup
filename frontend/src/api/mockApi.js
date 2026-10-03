const ACCOUNTS_KEY = 'pulseupLocalAccounts';

function readAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');

    return saved;
  } catch {
    return [];
  }
}

function saveNewAccount(account) {
  try {
    const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');

    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...saved, account]));
  } catch (error) {
    console.error('Could not save account:', error);
  }
}

function toSession(account) {
  const { password, ...user } = account;

  return {
    ...user,
    token: `local-token-${account.userId}`,
  };
}

function respond(config, status, data) {
  const response = { data, status, statusText: '', headers: {}, config };

  if (status >= 200 && status < 300) {
    return Promise.resolve(response);
  }

  return Promise.reject({
    isAxiosError: true,
    message: `Request failed with status code ${status}`,
    config,
    response,
  });
}

function register(config, body, role) {
  const email = String(body.email || '')
    .trim()
    .toLowerCase();

  if (readAccounts().some((account) => account.email === email)) {
    return respond(config, 409, {
      message: 'An account with this email address already exists.',
    });
  }

  const account = {
    ...body,
    email,
    role,
    userId: Date.now(),
  };

  saveNewAccount(account);

  return respond(config, 201, toSession(account));
}

export default function mockAdapter(config) {
  const url = config.url || '';

  const body =
    typeof config.data === 'string' ? JSON.parse(config.data || '{}') : {};

  if (url.includes('/auth/login')) {
    const email = String(body.email || '')
      .trim()
      .toLowerCase();

    const account = readAccounts().find(
      (item) => item.email === email && item.password === body.password,
    );

    if (!account) {
      return respond(config, 401, {
        message: 'Incorrect email address or password.',
      });
    }

    return respond(config, 200, toSession(account));
  }

  if (url.includes('/auth/register/student')) {
    return register(config, body, 'STUDENT');
  }

  if (url.includes('/auth/register/employee')) {
    return register(config, body, 'EMPLOYEE');
  }

  if (url.includes('/auth/register/staff')) {
    return register(config, body, 'STAFF');
  }

  if (url.includes('/auth/register/admin')) {
    return register(config, body, 'ADMIN');
  }

  return respond(config, 404, {
    message: 'This feature needs the PulseUp backend.',
  });
}
