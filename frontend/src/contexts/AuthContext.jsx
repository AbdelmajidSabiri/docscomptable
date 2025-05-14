import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in (token in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUserProfile = async (token) => {
    try {
      // Set default header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user profile
      const response = await axios.get(`${API_URL}/user/profile`);
      
      setUser({
        user: response.data.user,
        profile: response.data.profile,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout(); // Token might be invalid or expired
    }
  };
  
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user, profile } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data
      setUser({ user, profile });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { token, user, profile } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data
      setUser({ user, profile });
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };
  
  const logout = () => {
    // Remove token
    localStorage.removeItem('token');
    
    // Remove header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user data
    setUser(null);
  };
  
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/user/profile`, profileData);
      
      setUser(prev => ({
        ...prev,
        profile: response.data
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;