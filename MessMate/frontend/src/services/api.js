import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let demoAuthToken = null;

export const setDemoAuthToken = (token) => {
  demoAuthToken = token;
};

api.interceptors.request.use(async (config) => {
  if (auth?.currentUser && typeof auth.currentUser.getIdToken === 'function') {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } else if (demoAuthToken) {
    config.headers.Authorization = `Bearer ${demoAuthToken}`;
  }
  return config;
});

export const userAPI = {
  register: (data) => api.post('/users/register', data),
  registerDemoStudent: (data) => api.post('/users/demo/register', data),
  loginDemoStudent: (data) => api.post('/users/demo/login', data),
  verifyStudent: (data) => api.post('/authorized-students/verify', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAll: (params) => api.get('/users', { params }),
  updateRole: (id, data) => api.put(`/users/${id}`, data),
  toggleVerification: (id, data) => api.put(`/users/verify/${id}`, data),
  getAuthorized: (params) => api.get('/authorized-students', { params }),
  createAuthorized: (data) => api.post('/authorized-students', data),
  updateAuthorized: (id, data) => api.put(`/authorized-students/${id}`, data),
  deleteAuthorized: (id) => api.delete(`/authorized-students/${id}`),
  importAuthorized: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/authorized-students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
  publish: (id, isPublished) => api.patch(`/menu/${id}/publish`, { isPublished }),
};

export const mealAPI = {
  checkIn: (data) => api.post('/meals/check-in', data),
  getAttendance: (params) => api.get('/meals/attendance', { params }),
  getToday: () => api.get('/meals/today'),
  getDemand: (params) => api.get('/meals/demand', { params }),
};

export const leaveAPI = {
  create: (data) => api.post('/leaves', data),
  getAll: (params) => api.get('/leaves', { params }),
  updateStatus: (id, data) => api.put(`/leaves/${id}`, data),
  getUpcoming: () => api.get('/leaves/upcoming'),
};

export const feedbackAPI = {
  create: (data) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
};

export const foodWasteAPI = {
  getAll: (params) => api.get('/food-waste', { params }),
  create: (data) => api.post('/food-waste', data),
  getAnalytics: () => api.get('/food-waste/analytics'),
};

export const analyticsAPI = {
  get: () => api.get('/analytics'),
  getDemand: (params) => api.get('/analytics/demand', { params }),
};

export default api;
