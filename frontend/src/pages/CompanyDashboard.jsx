import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress 
} from '@mui/material';

const CompanyDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch company data here if needed
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Company Dashboard
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Welcome back, {user?.name || 'Company User'}
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={logout} 
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompanyDashboard; 