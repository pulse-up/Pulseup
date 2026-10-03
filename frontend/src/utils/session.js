const USER_STORAGE_KEY = 'pulseupUser';

const PROFILE_STORAGE_KEYS = [
  'pulseupStudentProfile',
  'pulseupStudentProfileImage',
  'pulseupStudentReadNotifications',
  'pulseupAdminProfile',
  'pulseupAdminPhoto',
  'pulseupAdminPrefs',
  'pulseupAdminReadNotifications',
];

export function getStoredUser() {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Could not read saved PulseUp user:', error);

    localStorage.removeItem(USER_STORAGE_KEY);

    return null;
  }
}

export function normalizeRole(role) {
  return String(role || '')
    .trim()
    .toUpperCase()
    .replace('ROLE_', '');
}

export function getStoredRole() {
  return normalizeRole(getStoredUser()?.role);
}

export function getRolePrefix(role) {
  switch (normalizeRole(role)) {
    case 'STUDENT':
      return '/student';

    case 'EMPLOYEE':
      return '/employee';

    case 'STAFF':
      return '/staff';

    case 'ADMIN':
      return '/admin';

    default:
      return '';
  }
}

export function getUserDisplayName(fallback = '') {
  const user = getStoredUser();

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  return fullName || fallback;
}

// Per-user details (emergency contact, allergies) are stored under this prefix.
const DETAILS_KEY_PREFIX = 'pulseupStudentDetails:';

export function clearSession() {
  localStorage.removeItem(USER_STORAGE_KEY);

  PROFILE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

  // Remove saved profile details too, so nothing medical stays on a shared computer.
  Object.keys(localStorage)
    .filter((key) => key.startsWith(DETAILS_KEY_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}
