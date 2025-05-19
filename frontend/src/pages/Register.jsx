import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  PersonOutlineOutlined,
  WorkOutlineOutlined,
  BusinessOutlined
} from '@mui/icons-material';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';

const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(3, 'Name should be at least 3 characters'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password should be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    role: Yup.string()
      .oneOf(['user', 'company'], 'Invalid role')
      .required('Role is required'),
    siret: Yup.string()
      .when('role', {
        is: 'company',
        then: () => Yup.string().required('SIRET number is required for company accounts')
      })
  });

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setRegisterError('');
      
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role
      };
      
      // Add company specific data if role is company
      if (values.role === 'company') {
        userData.siret = values.siret;
      }
      
      await register(userData);
      
      navigate('/login', { state: { message: 'Registration successful! You can now log in.' } });
    } catch (error) {
      setRegisterError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 8
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            Create Account
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Fill in your details to create a new account
          </Typography>
          
          {(registerError || authError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {registerError || authError}
            </Alert>
          )}
          
          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '', role: 'user', siret: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, setFieldValue }) => (
              <Form noValidate style={{ width: '100%' }}>
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
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
                
                <FormControl 
                  fullWidth 
                  margin="normal" 
                  error={touched.role && Boolean(errors.role)}
                >
                  <InputLabel id="role-label">Account Type</InputLabel>
                  <Field
                    as={Select}
                    labelId="role-label"
                    id="role"
                    name="role"
                    label="Account Type"
                    value={values.role}
                    onChange={(e) => setFieldValue('role', e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <WorkOutlineOutlined color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="user">Personal Account</MenuItem>
                    <MenuItem value="company">Business Account</MenuItem>
                  </Field>
                  {touched.role && errors.role && (
                    <FormHelperText>{errors.role}</FormHelperText>
                  )}
                </FormControl>
                
                {/* Conditional SIRET field for company registrations */}
                {values.role === 'company' && (
                  <Field
                    as={TextField}
                    margin="normal"
                    fullWidth
                    id="siret"
                    label="SIRET Number"
                    name="siret"
                    required
                    error={touched.siret && Boolean(errors.siret)}
                    helperText={touched.siret && errors.siret}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessOutlined color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
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
                
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                    fontSize: '1rem'
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign Up'
                  )}
                </Button>
                
                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography variant="body2" align="center">
                      Already have an account?{' '}
                      <Link to="/login" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                        Sign in
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 