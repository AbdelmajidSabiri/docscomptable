import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container, 
  Grid, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined, 
  EmailOutlined,
  AccountBalanceOutlined
} from '@mui/icons-material';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setLoginError('');
      
      console.log('Login attempt with:', { email: values.email }); // Don't log password
      
      const userData = await login({
        email: values.email,
        password: values.password
      });
      
      console.log('Login successful, user data:', userData);
      
      // Instead of going to /dashboard, directly navigate based on role
      if (userData) {
        console.log('Redirecting based on role:', userData.role);
        
        switch (userData.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'accountant':
            navigate('/accountant/dashboard');
            break;
          case 'company':
            navigate('/company/dashboard');
            break;
          case 'user':
            navigate('/user/dashboard');
            break;
          default:
            // Fallback to dashboard if role is unknown
            console.log('Unknown role, using default dashboard redirect');
            navigate('/dashboard');
        }
      } else {
        console.log('No user data returned, using default dashboard redirect');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left side - Login Form */}
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 2
        }}
      >
        <Container maxWidth="xs">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
              mt: isMobile ? 4 : 0
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4
              }}
            >
              <AccountBalanceOutlined 
                sx={{ 
                  color: 'primary.main',
                  fontSize: '2.5rem',
                  mr: 2
                }}
              />
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                DocsCompta
              </Typography>
            </Box>

            <Typography 
              component="h2" 
              variant="h5" 
              sx={{ 
                mb: 1, 
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Welcome Back
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 4, 
                textAlign: 'center'
              }}
            >
              Enter your credentials to access your account
            </Typography>
          </Box>
          
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ width: '100%', mb: 2 }}
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          )}
          
          {(loginError || authError) && (
            <Alert 
              severity="error" 
              sx={{ width: '100%', mb: 2 }}
            >
              {loginError || authError}
            </Alert>
          )}
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form noValidate style={{ width: '100%' }}>
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ 
                    mt: 3, 
                    mb: 2, 
                    py: 1.5, 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography variant="body2" align="center">
                      Don't have an account?{' '}
                      <Link to="/register" style={{ 
                        textDecoration: 'none', 
                        fontWeight: 'bold',
                        color: theme.palette.primary.main
                      }}>
                        Sign Up
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Container>
      </Box>
      
      {/* Right side - Image and gradient background (hidden on mobile) */}
      {!isMobile && (
        <Box 
          sx={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.main',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)'
          }}
        >
          <Box 
            sx={{
              width: '80%',
              height: '80%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              zIndex: 1,
              p: 4
            }}
          >
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                mb: 4, 
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Document Management System
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                textAlign: 'center',
                opacity: 0.9
              }}
            >
              Efficiently manage all your accounting documents
            </Typography>
            
            <Box 
              component="img"
              src="/accounting-illustration.svg"
              alt="Accounting Illustration"
              sx={{
                width: '70%',
                maxWidth: 400,
                mt: 4
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Box>
          
          {/* Decorative circles */}
          <Box 
            sx={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              top: -50,
              right: -50
            }}
          />
          
          <Box 
            sx={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              bottom: 50,
              left: -50
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Login; 