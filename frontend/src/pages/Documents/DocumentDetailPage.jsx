import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Divider,
  LinearProgress,
  Alert
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import useFetch from '../../hooks/useFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Fetch document data
  const {
    data: document,
    loading: documentLoading,
    error: documentError
  } = useFetch(`${API_URL}/documents/${id}`);
  
  // Fetch company data if document is loaded
  const {
    data: company,
    loading: companyLoading,
    error: companyError
  } = useFetch(document?.company_id ? `${API_URL}/companies/${document.company_id}` : null);
  
  if (documentLoading || companyLoading) {
    return <LinearProgress />;
  }
  
  if (documentError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {documentError.message || 'Error loading document'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/documents" variant="outlined">
            Back to Documents
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!document) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Document not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/documents" variant="outlined">
            Back to Documents
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Document Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {document.document_type} - {company?.name || 'Loading...'}
            </Typography>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              component={Link}
              to={`/documents/${document.company_id}`}
              sx={{ mr: 2 }}
            >
              Back to Documents
            </Button>
            
            {/* Show Process button for accountants when document status is "new" */}
            {(user.user.role === 'accountant' || user.user.role === 'admin') && 
             document.status === 'new' && (
              <Button
                variant="contained"
                component={Link}
                to={`/documents/process/${document.id}`}
              >
                Process Document
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Document Info */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Document Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Document Type
                </Typography>
                <Typography variant="body1">
                  {document.document_type}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Operation Type
                </Typography>
                <Typography variant="body1">
                  {document.operation_type}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Document Date
                </Typography>
                <Typography variant="body1">
                  {new Date(document.document_date).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Vendor/Client
                </Typography>
                <Typography variant="body1">
                  {document.vendor_client}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1">
                  {document.amount ? `€${document.amount}` : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={document.status}
                  color={
                    document.status === 'processed' ? 'success' :
                    document.status === 'new' ? 'warning' :
                    'error'
                  }
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Upload Date
                </Typography>
                <Typography variant="body1">
                  {new Date(document.upload_date).toLocaleDateString()}
                </Typography>
              </Grid>
              
              {document.status !== 'new' && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Processed By
                  </Typography>
                  <Typography variant="body1">
                    {document.processed_by || 'N/A'}
                  </Typography>
                </Grid>
              )}
              
              {document.status !== 'new' && document.processing_date && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Processing Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(document.processing_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              
              {document.comments && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Comments
                  </Typography>
                  <Typography variant="body1">
                    {document.comments}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Document Preview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Document Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {document.file_path ? (
              <Box sx={{ textAlign: 'center' }}>
                <Box 
                  component="iframe" 
                  src={document.file_path}
                  sx={{ 
                    width: '100%', 
                    height: '500px', 
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
                
                <Button
                  variant="outlined"
                  href={document.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in New Tab
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="body1" color="text.secondary">
                  No preview available for this document
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DocumentDetailPage;