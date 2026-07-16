import axios from 'axios';

// All requests go through /api — Vite's dev proxy (see vite.config.js) forwards
// this to your backend locally; in production, point your web server / CDN
// rewrite rules at the same backend.
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aho_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralised 401 handling — clear the stale token so the UI can react.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('aho_token');
    }
    return Promise.reject(error);
  }
);

/* ---------------------------------------------------------------- */
/* Public read endpoints                                            */
/* ---------------------------------------------------------------- */

export async function fetchProjects() {
  const { data } = await api.get('/projects');
  return data;
}

export async function fetchDonations() {
  const { data } = await api.get('/donations');
  return data;
}

export async function fetchSupporters() {
  const { data } = await api.get('/supporters');
  return data;
}

/* ---------------------------------------------------------------- */
/* Payments — M-Pesa STK Push                                       */
/* ---------------------------------------------------------------- */

export async function initiateMpesaStkPush({ phoneNumber, amount }) {
  const { data } = await api.post('/payments/mpesa/stkpush', {
    phoneNumber,
    amount,
  });
  return data;
}

/* ---------------------------------------------------------------- */
/* Auth                                                              */
/* ---------------------------------------------------------------- */

export async function loginRequest({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function registerRequest({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
}
