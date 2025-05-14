import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Alert,
  LinearProgress,
  FormHelperText
} from '@mui/material';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { AuthContext } from '../../contexts/AuthContext';
import useFetch from '../../hooks/useFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Validation schema
const validationSchema = Yup.object({
  operation_type: Yup.string()
    .required('Operation type is required'),
  document_type: Yup.string()
    .required('Document type is required'),
  document_date: Yup.date()
    .required('Document date is required')
    .max(new Date(), 'Document date cannot be in the future'),
  vendor_client: Yup.string()
    .required('Vendor/client is required'),
  document: Yup.mixed()
    .required('Document file is required')
    .test(
      'fileSize',
      'File size is too large (max 10MB)',
      value => !value || value.size <= 10 * 1024 * 1024
    )
    .test(
      'fileType',
      'Unsupported file format. Supported: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX',
      value => {
        if (!value) return true;
        const supportedTypes = [
          'application/pdf', 
          'image/jpeg', 
          'image/png', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        return supportedTypes.includes(value.type);
      }
    )
});

const DocumentUploadPage = () => {
  const { companyId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Fetch company data
  const {
    data: company,
    loading: companyLoading,
    error: companyError
  } = useFetch(`${API_URL}/companies/${companyId}`);
  
  // Check if user has permission to upload documents
  const canUpload = user && (
    user.user.role === 'company' || 
    user.user.role === 'accountant' || 
    user.user.role === 'admin'
  );
  
  if (companyLoading) {
    return <LinearProgress />;
  }
  
  if (companyError || !company) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {companyError ? companyError.message : 'Company not found'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/companies" variant="outlined">
            Back to Companies
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!canUpload) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          You don't have permission to upload documents
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/companies" variant="outlined">
            Back to Companies
          </Button>
        </Box>
      </Container>
    );
  }
  
  const initialValues = {
    operation_type: '',
    document_type: '',
    document_date: new Date().toISOString().split('T')[0],
    vendor_client: '',
    amount: '',
    comments: '',
    document: null
  };
  
  const handleFileChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    setFieldValue('document', file);
    setSelectedFile(file);
  };
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError('');
    setUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('company_id', companyId);
      formData.append('operation_type', values.operation_type);
      formData.append('document_type', values.document_type);
      formData.append('document_date', values.document_date);
      formData.append('vendor_client', values.vendor_client);
      formData.append('amount', values.amount);
      formData.append('comments', values.comments);
      formData.append('document', values.document);
      
      // Upload document
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document');
      }
      
      // Successfully uploaded document
      navigate(`/documents/${companyId}`);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.message || 'An error occurred while uploading the document');
      setUploading(false);
      setSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Document
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload a new document for {company.name}
        </Typography>
      </Paper>
      
      {/* Upload Form */}
      <Paper sx={{ p: 3 }}>
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
          {({ isSubmitting, touched, errors, values, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    id="operation_type"
                    name="operation_type"
                    label="Operation Type"
                    value={values.operation_type}
                    onChange={(e) => setFieldValue('operation_type', e.target.value)}
                    error={touched.operation_type && Boolean(errors.operation_type)}
                    helperText={touched.operation_type && errors.operation_type}
                    required
                  >
                    <MenuItem value="">Select Operation Type</MenuItem>
                    <MenuItem value="Income">Income</MenuItem>
                    <MenuItem value="Expense">Expense</MenuItem>
                    <MenuItem value="Investment">Investment</MenuItem>
                    <MenuItem value="Administrative">Administrative</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    id="document_type"
                    name="document_type"
                    label="Document Type"
                    value={values.document_type}
                    onChange={(e) => setFieldValue('document_type', e.target.value)}
                    error={touched.document_type && Boolean(errors.document_type)}
                    helperText={touched.document_type && errors.document_type}
                    required
                  >
                    <MenuItem value="">Select Document Type</MenuItem>
                    <MenuItem value="Invoice">Invoice</MenuItem>
                    <MenuItem value="Receipt">Receipt</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Bank Statement">Bank Statement</MenuItem>
                    <MenuItem value="Tax Document">Tax Document</MenuItem>
                    <MenuItem value="Report">Report</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="document_date"
                    name="document_date"
                    label="Document Date"
                    type="date"
                    value={values.document_date}
                    onChange={(e) => setFieldValue('document_date', e.target.value)}
                    error={touched.document_date && Boolean(errors.document_date)}
                    helperText={touched.document_date && errors.document_date}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="vendor_client"
                    name="vendor_client"
                    label="Vendor/Client"
                    value={values.vendor_client}
                    onChange={(e) => setFieldValue('vendor_client', e.target.value)}
                    error={touched.vendor_client && Boolean(errors.vendor_client)}
                    helperText={touched.vendor_client && errors.vendor_client}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="amount"
                    name="amount"
                    label="Amount"
                    type="number"
                    InputProps={{
                      startAdornment: '€',
                    }}
                    value={values.amount}
                    onChange={(e) => setFieldValue('amount', e.target.value)}
                    error={touched.amount && Boolean(errors.amount)}
                    helperText={touched.amount && errors.amount}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="comments"
                    name="comments"
                    label="Comments"
                    multiline
                    rows={3}
                    value={values.comments}
                    onChange={(e) => setFieldValue('comments', e.target.value)}
                    error={touched.comments && Boolean(errors.comments)}
                    helperText={touched.comments && errors.comments}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ border: '1px dashed grey', p: 3, borderRadius: 1, mb: 2 }}>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                      id="document"
                      name="document"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e, setFieldValue)}
                    />
                    <label htmlFor="document">
                      <Button
                        variant="contained"
                        component="span"
                      >
                        Choose File
                      </Button>
                    </label>
                    
                    <Box sx={{ mt: 2 }}>
                      {selectedFile ? (
                        <Typography variant="body2">
                          Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No file selected
                        </Typography>
                      )}
                    </Box>
                    
                    {touched.document && errors.document && (
                      <FormHelperText error>{errors.document}</FormHelperText>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Supported file formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (max 10MB)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || uploading}
                    sx={{ mr: 2 }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/documents/${companyId}`}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default DocumentUploadPage;