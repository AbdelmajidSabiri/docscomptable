// services/apiService.js
const API_BASE_URL = 'https://spirited-vitality-production.up.railway.app';
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(userData) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // User methods
  async getProfile(userId) {
    return this.request(`/api/users/${userId}`);
  }

  async updateProfile(userId, userData) {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Document methods
  async getDocuments(userId) {
    return this.request(`/api/documents?userId=${userId}`);
  }

  async uploadDocument(userId, documentData) {
    return this.request('/api/documents', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        ...documentData,
      }),
    });
  }

  async getDocumentById(documentId) {
    return this.request(`/api/documents/${documentId}`);
  }

  async updateDocumentStatus(documentId, status) {
    return this.request(`/api/documents/${documentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteDocument(documentId) {
    return this.request(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Dashboard stats
  async getDashboardStats(userId) {
    return this.request(`/api/dashboard/stats?userId=${userId}`);
  }

  // File upload with FormData
  async uploadFile(file, userId) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || 'document.jpg',
    });
    formData.append('userId', userId.toString());

    return fetch(`${this.baseURL}/api/documents/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      return response.json();
    });
  }
}

export default new ApiService();