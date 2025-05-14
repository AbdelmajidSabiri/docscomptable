import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const accountantService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/accountants`);
      return response.data;
    } catch (error) {
      console.error('Error fetching accountants:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/accountants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching accountant ${id}:`, error);
      throw error;
    }
  },
  
  create: async (accountantData) => {
    try {
      const response = await axios.post(`${API_URL}/accountants`, accountantData);
      return response.data;
    } catch (error) {
      console.error('Error creating accountant:', error);
      throw error;
    }
  },
  
  update: async (id, accountantData) => {
    try {
      const response = await axios.put(`${API_URL}/accountants/${id}`, accountantData);
      return response.data;
    } catch (error) {
      console.error(`Error updating accountant ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/accountants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting accountant ${id}:`, error);
      throw error;
    }
  }
};

export default accountantService;