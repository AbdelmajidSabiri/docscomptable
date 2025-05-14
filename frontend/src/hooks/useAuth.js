import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = !!auth.user;

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!auth.user) return false;
    
    // For multiple roles (array check)
    if (Array.isArray(role)) {
      return role.includes(auth.user.user.role);
    }
    
    // For single role
    return auth.user.user.role === role;
  };

  // Redirect to login if not authenticated
  const requireAuth = (callback, redirectTo = '/login') => {
    if (!isAuthenticated && !auth.loading) {
      navigate(redirectTo);
      return null;
    }
    
    return callback();
  };

  // Redirect to specific page if not having required role
  const requireRole = (role, callback, redirectTo = '/') => {
    if (!isAuthenticated && !auth.loading) {
      navigate('/login');
      return null;
    }
    
    if (!hasRole(role) && !auth.loading) {
      navigate(redirectTo);
      return null;
    }
    
    return callback();
  };

  return {
    ...auth,
    isAuthenticated,
    hasRole,
    requireAuth,
    requireRole
  };
};

export default useAuth;