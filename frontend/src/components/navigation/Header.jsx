import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Avatar, TextField, InputAdornment } from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/navigation/Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!user) return null;
  
  return (
    <Box className="header">
      <Box className="header-search">
        <TextField
          placeholder="Search customer..."
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <span className="search-icon">🔍</span>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Box className="header-actions">
        <Box className="header-filters">
          <Button 
            variant="outlined" 
            className="filter-button"
            startIcon={<span>🔽</span>}
          >
            Sort by
          </Button>
          
          <Button 
            variant="outlined" 
            className="filter-button"
            startIcon={<span>⚙️</span>}
          >
            Filters
          </Button>
        </Box>
        
        <Box className="header-user">
          <Button
            variant="text"
            className="user-btn"
          >
            <span className="user-label">Me</span>
          </Button>
          
          <Button
            variant="contained"
            className="add-btn"
            startIcon={<span>+</span>}
          >
            Add customer
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;