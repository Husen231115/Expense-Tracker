import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getUser: () => api.get('/auth/getUser'),
  uploadImage: (imageData) => api.post('/auth/upload-image', imageData),
};

// Income API
export const incomeAPI = {
  add: (incomeData) => api.post('/income/add', incomeData),
  getAll: (params) => api.get('/income/get', { params }),
  delete: (id) => api.delete(`/income/${id}`),
  downloadExcel: (params) => api.get('/income/downloadexcel', { params, responseType: 'blob' }),
};

// Expense API
export const expenseAPI = {
  add: (expenseData) => api.post('/expense/add', expenseData),
  getAll: (params) => api.get('/expense/get', { params }),
  delete: (id) => api.delete(`/expense/${id}`),
  downloadExcel: (params) => api.get('/expense/downloadexcel', { params, responseType: 'blob' }),
};

// Budget API
export const budgetAPI = {
  add: (budgetData) => api.post('/budgets', budgetData),
  getAll: (params) => api.get('/budgets', { params }),
  getById: (id) => api.get(`/budgets/${id}`),
  update: (id, budgetData) => api.put(`/budgets/${id}`, budgetData),
  delete: (id) => api.delete(`/budgets/${id}`),
  getSummary: () => api.get('/budgets/summary'),
};

// Category API
export const categoryAPI = {
  add: (categoryData) => api.post('/categories', categoryData),
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
  getStats: (params) => api.get('/categories/stats', { params }),
};

// Goal API
export const goalAPI = {
  add: (goalData) => api.post('/goals', goalData),
  getAll: (params) => api.get('/goals', { params }),
  getById: (id) => api.get(`/goals/${id}`),
  update: (id, goalData) => api.put(`/goals/${id}`, goalData),
  delete: (id) => api.delete(`/goals/${id}`),
  addContribution: (id, contributionData) => api.post(`/goals/${id}/contribute`, contributionData),
  getStats: () => api.get('/goals/stats'),
  getUpcoming: () => api.get('/goals/upcoming'),
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getStats: () => api.get('/notifications/stats'),
  checkBudgetAlerts: () => api.post('/notifications/check-budget-alerts'),
  checkGoalReminders: () => api.post('/notifications/check-goal-reminders'),
  cleanupExpired: () => api.delete('/notifications/cleanup-expired'),
};

// Dashboard API
export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  let message = 'Something went wrong';
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }
  
  toast.error(message);
  return message;
};

// Helper function to handle success responses
export const handleApiSuccess = (response, customMessage) => {
  const message = customMessage || response.data?.message || 'Success';
  toast.success(message);
  return response.data;
};

export default api;