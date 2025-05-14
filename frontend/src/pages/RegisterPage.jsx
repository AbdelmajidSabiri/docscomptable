import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button,
  Alert, 
  Paper,
  Grid,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import AuthContext from '../contexts/AuthContext';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password should be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .oneOf(['company', 'accountant'], 'Invalid role selected')
    .required('Role is required'),
  // Conditional fields for companies
  companyName: Yup.string()
    .when('role', {
      is: 'company',
      then: () => Yup.string().required('Company name is required'),
    }),
  taxId: Yup.string()
    .when('role', {
      is: 'company',
      then: () => Yup.string().required('Tax ID is required'),
    }),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'company', // Default role
    companyName: '',
    taxId: '',
    phone: '',
    address: '',
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    
    // Remove confirmPassword as it's not needed in the API
    const { confirmPassword, ...userData } = values;
    
    try {
      const { success, message } = await register(userData);
      if (success) {
        navigate('/');
      } else {
        setError(message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Register for DocsCompta
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors, values }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      variant="outlined"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      type="email"
                      variant="outlined"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="password"
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? 'Hide' : 'Show'}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      select
                      fullWidth
                      id="role"
                      name="role"
                      label="Register as"
                      variant="outlined"
                      error={touched.role && Boolean(errors.role)}
                      helperText={touched.role && errors.role}
                    >
                      <MenuItem value="company">Company</MenuItem>
                      <MenuItem value="accountant">Accountant</MenuItem>
                    </Field>
                  </Grid>
                  
                  {/* Conditional fields for companies */}
                  {values.role === 'company' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="companyName"
                          name="companyName"
                          label="Company Name"
                          variant="outlined"
                          error={touched.companyName && Boolean(errors.companyName)}
                          helperText={touched.companyName && errors.companyName}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="taxId"
                          name="taxId"
                          label="Tax ID / Registration Number"
                          variant="outlined"
                          error={touched.taxId && Boolean(errors.taxId)}
                          helperText={touched.taxId && errors.taxId}
                        />
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      variant="outlined"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="address"
                      name="address"
                      label="Address"
                      variant="outlined"
                      error={touched.address && Boolean(errors.address)}
                      helperText={touched.address && errors.address}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      sx={{ mt: 2 }}
                    >
                      {isSubmitting ? 'Processing...' : 'Register'}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'primary' }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;