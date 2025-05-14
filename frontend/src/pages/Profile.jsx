import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
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
  Avatar,
  Divider
} from '@mui/material';
import AuthContext from '../contexts/AuthContext';

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  phone: Yup.string(),
  address: Yup.string(),
  // Conditional validation for company users
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

const Profile = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  if (!user) {
    return null; // Or loading spinner
  }
  
  // Set initial form values based on user data
  const initialValues = {
    name: user.user.name || '',
    email: user.user.email || '',
    phone: user.profile?.phone || '',
    address: user.profile?.address || '',
    role: user.user.role,
    companyName: user.profile?.companyName || '',
    taxId: user.profile?.taxId || '',
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setSuccess('');
    
    try {
      const { success, message } = await updateProfile(values);
      
      if (success) {
        setSuccess('Profile updated successfully');
        // We don't navigate away so the user can see the success message
      } else {
        setError(message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mr: 3,
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {user.user.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Profile Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your account information
              </Typography>
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors, values }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  
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
                      disabled // Email cannot be changed
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  
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
                  
                  {user.user.role === 'company' && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          Company Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                      </Grid>
                      
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
                  
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isSubmitting}
                      sx={{ mr: 2 }}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/change-password"
                    >
                      Change Password
                    </Button>
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

export default Profile;