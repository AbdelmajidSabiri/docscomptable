import { useState, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import useFetch from '../../hooks/useFetch';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DocumentUploadPage = () => {
  const { companyId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State for stepper
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Documents', 'Add Details', 'Review & Upload'];
  
  // State for file upload
  const [files, setFiles] = useState([]);
  const [filesPreviews, setFilesPreviews] = useState([]);
  
  // State for document details
  const [documentDetails, setDocumentDetails] = useState({
    documentType: '',
    operationType: '',
    documentDate: new Date().toISOString().split('T')[0],
    vendorClient: '',
    amount: '',
    reference: '',
    comments: ''
  });
  
  // State for form validation
  const [errors, setErrors] = useState({});
  
  // State for upload status
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState({
    success: false,
    error: false,
    message: ''
  });
  
  // Fetch company data if companyId is provided
  const {
    data: company,
    loading: companyLoading,
    error: companyError
  } = useFetch(companyId ? `${API_URL}/companies/${companyId}` : null);
  
  // Options for dropdowns
  const documentTypes = [
    'Invoice', 
    'Receipt', 
    'Bank Statement', 
    'Contract', 
    'Tax Document',
    'Payroll Document',
    'Insurance Document',
    'Other'
  ];
  
  const operationTypes = [
    'Income',
    'Expense',
    'Administrative',
    'Legal',
    'Tax Related',
    'Banking',
    'Other'
  ];
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
    
    // Generate previews for selected files
    selectedFiles.forEach(file => {
      // Only generate previews for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilesPreviews(prev => [
            ...prev,
            {
              file,
              name: file.name,
              preview: reader.result
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files (like PDFs), use a generic icon/preview
        setFilesPreviews(prev => [
          ...prev,
          {
            file,
            name: file.name,
            preview: null,
            type: file.type
          }
        ]);
      }
    });
  };
  
  // Handle input changes for document details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentDetails({
      ...documentDetails,
      [name]: value
    });
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Remove a file from the selection
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newPreviews = [...filesPreviews];
    newPreviews.splice(index, 1);
    setFilesPreviews(newPreviews);
  };
  
  // Validate form before moving to next step
  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (files.length === 0) {
        newErrors.files = 'Please select at least one document to upload';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      }
    }
    
    if (activeStep === 1) {
      if (!documentDetails.documentType) {
        newErrors.documentType = 'Document type is required';
      }
      
      if (!documentDetails.operationType) {
        newErrors.operationType = 'Operation type is required';
      }
      
      if (!documentDetails.documentDate) {
        newErrors.documentDate = 'Document date is required';
      }
      
      setErrors(newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step button
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle document upload
  const handleUpload = async () => {
    if (!validateStep()) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload each file with the same metadata
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        
        // Add file to form data
        formData.append('file', file);
        
        // Add document details to form data
        formData.append('documentType', documentDetails.documentType);
        formData.append('operationType', documentDetails.operationType);
        formData.append('documentDate', documentDetails.documentDate);
        formData.append('vendorClient', documentDetails.vendorClient);
        formData.append('amount', documentDetails.amount);
        formData.append('reference', documentDetails.reference);
        formData.append('comments', documentDetails.comments);
        formData.append('companyId', companyId || '');
        
        // Calculate progress per file
        const progressPerFile = 100 / files.length;
        const startProgress = i * progressPerFile;
        
        // Upload file
        await axios.post(`${API_URL}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const totalProgress = startProgress + (percentCompleted * progressPerFile / 100);
            setUploadProgress(totalProgress);
          }
        });
      }
      
      // All files uploaded successfully
      setUploadStatus({
        success: true,
        error: false,
        message: `${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully!`
      });
      setUploading(false);
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      setUploading(false);
      setUploadStatus({
        success: false,
        error: true,
        message: error.response?.data?.message || 'Failed to upload documents. Please try again.'
      });
    }
  };
  
  // Render step content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Please select the document(s) you want to upload. You can upload multiple files at once.
            </Typography>
            
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Button
                variant="contained"
                component="label"
                size="large"
                sx={{ py: 1.5, px: 4 }}
                startIcon="📁"
              >
                Select Files
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                />
              </Button>
            </Box>
            
            {errors.files && (
              <Alert severity="error" sx={{ my: 2 }}>
                {errors.files}
              </Alert>
            )}
            
            {filesPreviews.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Files ({filesPreviews.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {filesPreviews.map((file, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ position: 'relative' }}>
                        {file.preview ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={file.preview}
                            alt={file.name}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 140,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100',
                              flexDirection: 'column',
                              gap: 1
                            }}
                          >
                            <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50 }}>
                              {file.type?.includes('pdf') ? 'PDF' : 
                               file.type?.includes('word') ? 'DOC' : 
                               file.type?.includes('sheet') || file.type?.includes('excel') ? 'XLS' : 
                               'DOC'}
                            </Avatar>
                            <Typography variant="body2" color="text.secondary" sx={{ px: 2, textAlign: 'center', wordBreak: 'break-word' }}>
                              {file.name}
                            </Typography>
                          </Box>
                        )}
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            bgcolor: 'background.paper',
                            '&:hover': {
                              bgcolor: 'error.light',
                              color: 'white'
                            }
                          }}
                          onClick={() => removeFile(index)}
                        >
                          ✖️
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Please provide details about the document(s). These details will be applied to all selected documents.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.documentType} required>
                  <InputLabel id="document-type-label">Document Type</InputLabel>
                  <Select
                    labelId="document-type-label"
                    name="documentType"
                    value={documentDetails.documentType}
                    onChange={handleInputChange}
                    label="Document Type"
                  >
                    {documentTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                  {errors.documentType && (
                    <FormHelperText>{errors.documentType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.operationType} required>
                  <InputLabel id="operation-type-label">Operation Type</InputLabel>
                  <Select
                    labelId="operation-type-label"
                    name="operationType"
                    value={documentDetails.operationType}
                    onChange={handleInputChange}
                    label="Operation Type"
                  >
                    {operationTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                  {errors.operationType && (
                    <FormHelperText>{errors.operationType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  name="documentDate"
                  label="Document Date"
                  type="date"
                  value={documentDetails.documentDate}
                  onChange={handleInputChange}
                  error={!!errors.documentDate}
                  helperText={errors.documentDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="vendorClient"
                  label="Vendor/Client Name"
                  value={documentDetails.vendorClient}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount"
                  type="number"
                  value={documentDetails.amount}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: '€',
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="reference"
                  label="Reference Number"
                  value={documentDetails.reference}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="comments"
                  label="Comments"
                  multiline
                  rows={3}
                  value={documentDetails.comments}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Please review the document details before uploading.
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Files to Upload
                  </Typography>
                  <Typography variant="body1">
                    {files.length} file(s) selected
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <List dense>
                      {files.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {file.type?.includes('pdf') ? '📄' : 
                             file.type?.includes('image') ? '🖼️' : 
                             file.type?.includes('word') ? '📝' : 
                             file.type?.includes('sheet') || file.type?.includes('excel') ? '📊' : 
                             '📄'}
                          </ListItemIcon>
                          <ListItemText 
                            primary={file.name}
                            secondary={`${(file.size / 1024).toFixed(2)} KB`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Document Type
                  </Typography>
                  <Typography variant="body1">
                    {documentDetails.documentType}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Operation Type
                  </Typography>
                  <Typography variant="body1">
                    {documentDetails.operationType}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Document Date
                  </Typography>
                  <Typography variant="body1">
                    {documentDetails.documentDate}
                  </Typography>
                </Grid>
                
                {documentDetails.vendorClient && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vendor/Client
                    </Typography>
                    <Typography variant="body1">
                      {documentDetails.vendorClient}
                    </Typography>
                  </Grid>
                )}
                
                {documentDetails.amount && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="body1">
                      €{documentDetails.amount}
                    </Typography>
                  </Grid>
                )}
                
                {documentDetails.reference && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reference
                    </Typography>
                    <Typography variant="body1">
                      {documentDetails.reference}
                    </Typography>
                  </Grid>
                )}
                
                {documentDetails.comments && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Comments
                    </Typography>
                    <Typography variant="body1">
                      {documentDetails.comments}
                    </Typography>
                  </Grid>
                )}
                
                {companyId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Uploading for Company
                    </Typography>
                    <Typography variant="body1">
                      {company ? company.name : companyId}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            {uploading && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <CircularProgress variant="determinate" value={uploadProgress} size={60} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Uploading... {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            )}
            
            {uploadStatus.success && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {uploadStatus.message}
              </Alert>
            )}
            
            {uploadStatus.error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {uploadStatus.message}
              </Alert>
            )}
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  // Actions to take after successful upload
  const handleUploadSuccess = () => {
    navigate(companyId ? `/documents/${companyId}` : '/documents');
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Upload Documents
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {company ? `Upload and categorize documents for ${company.name}` : 'Upload and categorize accounting documents for processing'}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            component={Link}
            to={companyId ? `/documents/${companyId}` : '/documents'}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
      
      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      {/* Step Content */}
      <Paper sx={{ p: 3 }}>
        {getStepContent(activeStep)}
        
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep > 0 && (
            <Button 
              onClick={handleBack} 
              sx={{ mr: 1 }}
              disabled={uploading}
            >
              Back
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : !uploadStatus.success ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Documents'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleUploadSuccess}
            >
              View Documents
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default DocumentUploadPage;