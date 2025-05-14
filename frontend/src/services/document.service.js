import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const documentService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      throw error;
    }
  },
  
  getByCompany: async (companyId) => {
    try {
      const response = await axios.get(`${API_URL}/documents/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching documents for company ${companyId}:`, error);
      throw error;
    }
  },
  
  uploadDocument: async (formData, onProgress) => {
    try {
      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },
  
  processDocument: async (id, status, comments) => {
    try {
      const response = await axios.patch(`${API_URL}/documents/${id}/process`, {
        status,
        comments
      });
      return response.data;
    } catch (error) {
      console.error(`Error processing document ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }
};

export default documentService;