import { useState, useEffect, createContext } from 'react';
import axios from 'axios';

// Create context with default values
export const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateProfile: () => {}
});

// API URL from environment variables or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Mock user data for development
const MOCK_USER = {
  user: {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'admin'
  },
  profile: {
    id: 1,
    phone: '123-456-7890',
    address: '123 Main St'
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // Initialize with mock user for development
  const [user, setUser] = useState(MOCK_USER);
  const [loading, setLoading] = useState(false);
  
  // Check for existing auth on component mount
  useEffect(() => {
    console.log('AuthProvider initialized with mock user');
    /*
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
    */
  }, []);
  
  // Fetch user profile with token
  const fetchUserProfile = async (token) => {
    try {
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Mock response for demo (replace with actual API call in production)
      // const response = await axios.get(`${API_URL}/user/profile`);
      
      setUser(MOCK_USER);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout(); // Token might be invalid
    }
  };
  
  // Login function
  const login = async (email, password) => {
    try {
      // Mock successful login for demo
      // const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      const mockToken = 'mock_jwt_token';
      const mockUserData = {
        user: {
          id: 1,
          name: email.split('@')[0],
          email: email,
          role: 'admin'
        },
        profile: {
          id: 1
        }
      };
      
      // Store token
      localStorage.setItem('token', mockToken);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
      
      // Set user state
      setUser(mockUserData);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      // Mock successful registration
      // const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const mockToken = 'mock_jwt_token';
      const mockUserData = {
        user: {
          id: 1,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'company'
        },
        profile: {
          id: 1,
          ...userData
        }
      };
      
      // Store token
      localStorage.setItem('token', mockToken);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
      
      // Set user state
      setUser(mockUserData);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };
  
  // Logout function
  const logout = () => {
    // Remove token
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user data
    setUser(null);
  };
  
  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      // Mock successful profile update
      // const response = await axios.put(`${API_URL}/user/profile`, profileData);
      
      // Update user state with new profile data
      setUser(prev => ({
        ...prev,
        user: {
          ...prev.user,
          name: profileData.name
        },
        profile: {
          ...prev.profile,
          ...profileData
        }
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
  
  // Return provider with context value
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