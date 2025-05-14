import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h1" component="h1" color="primary" sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            
            <Button 
              variant="outlined" 
              component={Link} 
              to="/"
            >
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;