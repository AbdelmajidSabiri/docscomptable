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
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  Tooltip,
  IconButton
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import useFetch from '../../hooks/useFetch';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for processing dialog
  const [processingDialog, setProcessingDialog] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('processed');
  const [processingComments, setProcessingComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState('');
  
  // State for document viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  
  // Fetch document data
  const {
    data: document,
    loading: documentLoading,
    error: documentError,
    refetch: refetchDocument
  } = useFetch(`${API_URL}/documents/${id}`);
  
  // Fetch company data if document is loaded
  const {
    data: company,
    loading: companyLoading,
    error: companyError
  } = useFetch(document?.company_id ? `${API_URL}/companies/${document.company_id}` : null);
  
  // Check if user has permission to view/process document
  const canProcess = user && (
    (user.user.role === 'accountant' && company?.accountant_id === user.profile?.id) ||
    user.user.role === 'admin'
  );
  
  // Handle process dialog open
  const handleProcessDialogOpen = () => {
    setProcessingDialog(true);
  };
  
  // Handle process dialog close
  const handleProcessDialogClose = () => {
    setProcessingDialog(false);
  };
  
  // Handle process status change
  const handleStatusChange = (e) => {
    setProcessingStatus(e.target.value);
  };
  
  // Handle comments change
  const handleCommentsChange = (e) => {
    setProcessingComments(e.target.value);
  };
  
  // Handle document processing
  const handleProcessDocument = async () => {
    try {
      setProcessing(true);
      setProcessingError('');
      
      const response = await axios.patch(
        `${API_URL}/documents/${id}/process`,
        {
          status: processingStatus,
          comments: processingComments
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      // Close dialog and refresh document data
      setProcessingDialog(false);
      refetchDocument();
      
    } catch (error) {
      console.error('Error processing document:', error);
      setProcessingError(error.response?.data?.message || 'Failed to process document');
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle document download
  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents/${id}/download`, {
        responseType: 'blob',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Create download link and click it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.file_name || `document-${id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };
  
  // Toggle document viewer
  const toggleViewer = () => {
    setViewerOpen(!viewerOpen);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'new':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };
  
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
              to={document.company_id ? `/documents/${document.company_id}` : '/documents'}
              sx={{ mr: 2 }}
            >
              Back to Documents
            </Button>
            
            {/* Show Process button for accountants when document status is "new" */}
            {canProcess && document.status === 'new' && (
              <Button
                variant="contained"
                onClick={handleProcessDialogOpen}
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
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {document.document_type}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Operation Type
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {document.operation_type}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Document Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(document.document_date).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Vendor/Client
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {document.vendor_client || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {document.amount ? `€${document.amount}` : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reference
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {document.reference || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={document.status}
                  color={getStatusColor(document.status)}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Upload Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(document.upload_date).toLocaleDateString()}
                </Typography>
              </Grid>
              
              {document.status !== 'new' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Processed By
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {document.processed_by_name || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  {document.processing_date && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Processing Date
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {new Date(document.processing_date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
              
              {document.comments && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Comments
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'background.default', 
                      borderRadius: 1 
                    }}
                  >
                    <Typography variant="body2">
                      {document.comments}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleDownload}
                startIcon="⬇️"
              >
                Download
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Document Preview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Document Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
              }}
            >
              {document.file_path || document.thumbnail ? (
                <>
                  {/* Document preview box */}
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '400px', 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      bgcolor: 'background.default'
                    }}
                  >
                    {document.file_mime?.includes('image') ? (
                      // Image preview
                      <img 
                        src={`${API_URL}/documents/${id}/download`}
                        alt={document.file_name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : document.file_mime?.includes('pdf') ? (
                      // PDF icon
                      <Box sx={{ textAlign: 'center' }}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            bgcolor: '#f44336', 
                            color: 'white',
                            borderRadius: 1,
                            display: 'inline-flex',
                            mb: 2
                          }}
                        >
                          <Typography variant="h4">PDF</Typography>
                        </Box>
                        <Typography variant="body1">
                          {document.file_name}
                        </Typography>
                      </Box>
                    ) : (
                      // Generic document icon
                      <Box sx={{ textAlign: 'center' }}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            borderRadius: 1,
                            display: 'inline-flex',
                            mb: 2
                          }}
                        >
                          <Typography variant="h4">DOC</Typography>
                        </Box>
                        <Typography variant="body1">
                          {document.file_name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* View controls */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={toggleViewer}
                    >
                      {viewerOpen ? 'Close Viewer' : 'Open Full Viewer'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={handleDownload}
                    >
                      Download File
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No preview available for this document
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleDownload}
                    sx={{ mt: 2 }}
                  >
                    Download to View
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Document Processing Dialog */}
      <Dialog
        open={processingDialog}
        onClose={handleProcessDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Process Document</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the document status and add any necessary comments.
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="processing-status-label">Status</InputLabel>
            <Select
              labelId="processing-status-label"
              value={processingStatus}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="processed">Processed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Comments"
            multiline
            rows={4}
            value={processingComments}
            onChange={handleCommentsChange}
            placeholder={
              processingStatus === 'rejected' 
                ? 'Please provide a reason for rejection' 
                : 'Add any notes or comments about this document'
            }
          />
          
          {processingError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {processingError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProcessDialogClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleProcessDocument}
            variant="contained"
            color={processingStatus === 'processed' ? 'success' : 'error'}
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Full Page Document Viewer */}
      <Dialog
        open={viewerOpen}
        onClose={toggleViewer}
        fullWidth
        maxWidth="lg"
        fullScreen
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {document.file_name}
            </Typography>
            <Button variant="outlined" onClick={toggleViewer}>
              Close Viewer
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {document.file_mime?.includes('image') ? (
            // Image viewer
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 100px)',
                bgcolor: 'black'
              }}
            >
              <img
                src={`${API_URL}/documents/${id}/download`}
                alt={document.file_name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Box>
          ) : document.file_mime?.includes('pdf') ? (
            // PDF viewer
            <iframe
              src={`${API_URL}/documents/${id}/download`}
              width="100%"
              height="calc(100vh - 100px)"
              title="PDF Viewer"
              style={{ border: 'none' }}
            />
          ) : (
            // Unsupported file type
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 100px)',
                p: 3
              }}
            >
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Preview not available for this file type
              </Typography>
              <Button
                variant="contained"
                onClick={handleDownload}
                sx={{ mt: 2 }}
              >
                Download File
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default DocumentDetailPage;