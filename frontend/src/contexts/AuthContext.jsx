import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Get API URL from environment or fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('Using API URL:', API_URL);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        // Configure request headers
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        console.log('Verifying token and fetching profile...');
        
        // Get user profile
        const response = await axios.get(`${API_URL}/auth/profile`, config);
        console.log('Profile response:', response.data);
        
        if (!response.data.user) {
          console.error('No user data in profile response');
          throw new Error('Invalid user profile response');
        }
        
        // Debug JWT token content
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('JWT Payload from stored token:', payload);
            
            // If user role is missing in response but present in token, use it from token
            if (!response.data.user.role && payload.role) {
              response.data.user.role = payload.role;
              console.log('Using role from token:', payload.role);
            }
          }
        } catch (e) {
          console.error('Error parsing JWT:', e);
        }
        
        setUser(response.data.user);
        console.log('User set after profile verification:', response.data.user);
        setError('');
      } catch (err) {
        console.error('Auth verification error:', err);
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
        setError('Authentication expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const register = async (userData) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError('');
      console.log('Login credentials:', { email: credentials.email }); // Don't log password
      
      // Extract email and password directly to ensure correct format for API
      const { email, password } = credentials;
      
      console.log('Making API request to:', `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('API Response:', response.data);
      
      const { token: authToken, user: userData } = response.data;
      
      if (!authToken) {
        console.error('No token received in response');
        throw new Error('Authentication failed - no token received');
      }

      // Debug JWT token content
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('JWT Payload:', payload);
        }
      } catch (e) {
        console.error('Error parsing JWT:', e);
      }
      
      localStorage.setItem('token', authToken);
      setToken(authToken);

      // Make sure we're setting user data correctly
      console.log('Setting user data:', userData);
      setUser(userData);
      
      return userData;
    } catch (err) {
      console.error('Login error details:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';
  const isAccountant = user?.role === 'accountant';

  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isAccountant,
    loading,
    error,
    register,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;