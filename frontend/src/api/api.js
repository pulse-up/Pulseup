import axios from 'axios';

import { USE_BACKEND } from '../constants/appConfig';
import mockAdapter from './mockApi';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',

  timeout: 15000,

  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

if (!USE_BACKEND) {
  api.defaults.adapter = mockAdapter;
}

function getStoredUser() {
  const storedUser = localStorage.getItem('pulseupUser');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Invalid pulseupUser data:', error);

    localStorage.removeItem('pulseupUser');

    return null;
  }
}

function getAuthenticationToken() {
  const storedUser = getStoredUser();

  if (!storedUser) {
    return '';
  }

  return storedUser.token || storedUser.accessToken || storedUser.jwt || '';
}

api.interceptors.request.use(
  (config) => {
    const token = getAuthenticationToken();

    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    const requestUrl = error.config?.url || '';

    const isLoginRequest = requestUrl.includes('/auth/login');

    const isRegistrationRequest = requestUrl.includes('/auth/register');

    if (status === 401 && !isLoginRequest && !isRegistrationRequest) {
      localStorage.removeItem('pulseupUser');

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    if (status === 403 && !isLoginRequest && !isRegistrationRequest) {
      console.error('Access denied for request:', requestUrl);
    }

    if (!error.response) {
      console.error('PulseUp backend connection failed:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
