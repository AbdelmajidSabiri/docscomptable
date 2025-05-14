import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const companyService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/companies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },
  
  create: async (companyData) => {
    try {
      const response = await axios.post(`${API_URL}/companies`, companyData);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },
  
  update: async (id, companyData) => {
    try {
      const response = await axios.put(`${API_URL}/companies/${id}`, companyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  }
};

export default companyService;