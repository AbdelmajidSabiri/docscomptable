import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const notificationService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  
  markAsRead: async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      const response = await axios.patch(`${API_URL}/notifications/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      throw error;
    }
  }
};

export default notificationService;