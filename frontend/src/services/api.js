import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Add a request interceptor to include the auth token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: (email, password) => axios.post(`${API_URL}/auth/login`, { email, password }),
  register: (userData) => axios.post(`${API_URL}/auth/register`, userData),
  getUserProfile: () => axios.get(`${API_URL}/user/profile`),
  updateProfile: (profileData) => axios.put(`${API_URL}/user/profile`, profileData),
  changePassword: (data) => axios.post(`${API_URL}/auth/change-password`, data)
};

// Companies API
export const companies = {
  getAll: (params) => axios.get(`${API_URL}/companies`, { params }),
  getById: (id) => axios.get(`${API_URL}/companies/${id}`),
  create: (data) => axios.post(`${API_URL}/companies`, data),
  update: (id, data) => axios.put(`${API_URL}/companies/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/companies/${id}`),
  getDocuments: (companyId) => axios.get(`${API_URL}/documents/company/${companyId}`)
};

// Documents API
export const documents = {
  getAll: (params) => axios.get(`${API_URL}/documents`, { params }),
  getById: (id) => axios.get(`${API_URL}/documents/${id}`),
  getByCompany: (companyId) => axios.get(`${API_URL}/documents/company/${companyId}`),
  upload: (data, onUploadProgress) => {
    const formData = new FormData();
    
    // Add file(s)
    if (Array.isArray(data.files)) {
      data.files.forEach(file => {
        formData.append('files', file);
      });
    } else if (data.files) {
      formData.append('files', data.files);
    }
    
    // Add other data
    for (const key in data) {
      if (key !== 'files') {
        formData.append(key, data[key]);
      }
    }
    
    return axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },
  updateStatus: (id, status) => axios.patch(`${API_URL}/documents/${id}/status`, { status }),
  delete: (id) => axios.delete(`${API_URL}/documents/${id}`)
};

// Notifications API
export const notifications = {
  getAll: () => axios.get(`${API_URL}/notifications`),
  markAsRead: (id) => axios.patch(`${API_URL}/notifications/${id}/read`),
  markAllAsRead: () => axios.patch(`${API_URL}/notifications/read-all`),
  delete: (id) => axios.delete(`${API_URL}/notifications/${id}`)
};

export default {
  auth,
  companies,
  documents,
  notifications
};