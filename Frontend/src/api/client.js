import axios from 'axios';

// All requests go through /api — Vite's dev proxy forwards to Flask backend locally
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aho_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralised 401 response handling
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
/* Auth Endpoints                                                   */
/* ---------------------------------------------------------------- */

export async function loginRequest({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function registerRequest({ name, email, password, role }) {
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function fetchAdminRequests() {
  const { data } = await api.get('/auth/admin/requests');
  return data;
}

export async function approveAdminRequest(userId) {
  const { data } = await api.post(`/auth/admin/requests/${userId}/approve`);
  return data;
}

export async function rejectAdminRequest(userId) {
  const { data } = await api.post(`/auth/admin/requests/${userId}/reject`);
  return data;
}

/* ---------------------------------------------------------------- */
/* Project Endpoints                                                */
/* ---------------------------------------------------------------- */

export async function fetchProjects() {
  const { data } = await api.get('/projects');
  return data;
}

export async function fetchProjectDetails(id) {
  const { data } = await api.get(`/projects/${id}`);
  return data;
}

export async function createProject(projectData) {
  const { data } = await api.post('/projects', projectData);
  return data;
}

export async function updateProject(id, projectData) {
  const { data } = await api.put(`/projects/${id}`, projectData);
  return data;
}

export async function deleteProject(id) {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
}

/* ---------------------------------------------------------------- */
/* Blog Endpoints                                                   */
/* ---------------------------------------------------------------- */

export async function fetchBlogs() {
  const { data } = await api.get('/blogs');
  return data;
}

export async function fetchBlogDetails(id) {
  const { data } = await api.get(`/blogs/${id}`);
  return data;
}

export async function createBlog(blogData) {
  const { data } = await api.post('/blogs', blogData);
  return data;
}

export async function updateBlog(id, blogData) {
  const { data } = await api.put(`/blogs/${id}`, blogData);
  return data;
}

export async function deleteBlog(id) {
  const { data } = await api.delete(`/blogs/${id}`);
  return data;
}

/* ---------------------------------------------------------------- */
/* Calendar Endpoints                                               */
/* ---------------------------------------------------------------- */

export async function fetchCalendarEvents() {
  const { data } = await api.get('/calendar');
  return data;
}

export async function createCalendarEvent(eventData) {
  const { data } = await api.post('/calendar', eventData);
  return data;
}

export async function updateCalendarEvent(id, eventData) {
  const { data } = await api.put(`/calendar/${id}`, eventData);
  return data;
}

export async function deleteCalendarEvent(id) {
  const { data } = await api.delete(`/calendar/${id}`);
  return data;
}

/* ---------------------------------------------------------------- */
/* Donations & Supporters                                           */
/* ---------------------------------------------------------------- */

export async function fetchDonations() {
  const { data } = await api.get('/donations');
  return data;
}

export async function fetchSupporters() {
  const { data } = await api.get('/supporters');
  return data;
}

export async function initiateMpesaStkPush({ phoneNumber, amount }) {
  const { data } = await api.post('/payments/mpesa/stkpush', {
    phoneNumber,
    amount,
  });
  return data;
}
