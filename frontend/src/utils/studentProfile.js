import { USE_BACKEND } from '../constants/appConfig';
import api from '../api/api';
import { getStoredRole, getStoredUser } from './session';

const DETAILS_KEY_PREFIX = 'pulseupStudentDetails:';

export const STUDENT_IMAGE_KEY = 'pulseupStudentProfileImage';

export const STUDENT_PROFILE_EVENT = 'pulseup-student-profile-change';

function getDetailsKey(user) {
  return `${DETAILS_KEY_PREFIX}${user?.userId ?? user?.email ?? 'guest'}`;
}

// Details that PulseUp already knows from registration or login.
export function getRegistrationDetails() {
  const user = getStoredUser() || {};

  return {
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    studentNumber: user.studentNumber || '',
    email: user.email || '',
    phone: user.phoneNumber || user.phone || '',
    course: user.course || '',
    campus: user.campus || '',
    residence: user.residence || '',
    yearOfStudy: user.yearOfStudy || '',
    emergencyName: user.emergencyContactName || '',
    emergencyRelation: user.emergencyContactRelation || '',
    emergencyPhone: user.emergencyContactPhone || '',
    bloodType: user.bloodType || '',
    allergies: user.allergies || '',
    employeeNumber: user.employeeNumber || '',
    jobTitle: user.jobTitle || '',
    department: user.department || '',
  };
}

// Students have study details; university employees have work details instead.
export function isStudentAccount() {
  return getStoredRole() !== 'EMPLOYEE';
}

// Loads the saved profile from the backend and keeps it in the stored user,
// so the profile page and headers show it straight after sign-in.
export async function fetchStudentProfile() {
  if (!USE_BACKEND || getStoredRole() !== 'STUDENT') {
    return null;
  }

  const response = await api.get('/students/me');
  const user = getStoredUser() || {};

  localStorage.setItem('pulseupUser', JSON.stringify({ ...user, ...response.data }));

  window.dispatchEvent(new Event(STUDENT_PROFILE_EVENT));

  return getStudentDetails();
}

// Registration details first, then anything the student saved on this page.
export function getStudentDetails() {
  const registration = getRegistrationDetails();

  try {
    const saved = JSON.parse(
      localStorage.getItem(getDetailsKey(getStoredUser())) || '{}',
    );

    return { ...registration, ...saved };
  } catch {
    return registration;
  }
}

// Sends the fields the backend stores; the rest stay in this browser only.
export async function saveStudentDetailsToBackend(details) {
  if (!USE_BACKEND || getStoredRole() !== 'STUDENT') {
    return;
  }

  const nameParts = details.fullName.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';

  await api.put('/students/me/profile', {
    firstName: nameParts.join(' '),
    lastName,
    email: details.email,
    phoneNumber: details.phone,
    course: details.course,
    campus: details.campus,
    residence: details.residence,
    yearOfStudy: details.yearOfStudy,
    emergencyContactName: details.emergencyName || null,
    emergencyContactPhone: details.emergencyPhone || null,
  });
}

export function saveStudentDetails(details) {
  const user = getStoredUser();

  localStorage.setItem(getDetailsKey(user), JSON.stringify(details));

  if (user && !USE_BACKEND) {
    const nameParts = details.fullName.trim().split(/\s+/);

    const lastName = nameParts.length > 1 ? nameParts.pop() : '';

    localStorage.setItem(
      'pulseupUser',
      JSON.stringify({
        ...user,
        firstName: nameParts.join(' '),
        lastName,
        email: details.email,
        phoneNumber: details.phone,
        studentNumber: details.studentNumber,
      }),
    );
  }

  window.dispatchEvent(new Event(STUDENT_PROFILE_EVENT));
}

export function getStudentInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return '??';
  }

  const initials =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];

  return initials.toUpperCase();
}
