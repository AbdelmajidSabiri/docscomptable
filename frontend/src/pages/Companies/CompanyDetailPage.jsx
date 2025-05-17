import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Card,
  CardContent,
  Avatar,
  Tooltip,
  IconButton,
  alpha
} from '@mui/material';

// Import custom components
import DocumentCard from '../../components/documents/DocumentCard';
import StatCard from '../../components/common/StatCard';

// Mock data for demo
const mockCompanies = {
  '1': {
    id: 1,
    name: 'Acme Corporation',
    taxId: 'ACM123456',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY',
    status: 'active',
    accountant_name: 'Jane Doe',
    created_at: '2023-01-15',
    updated_at: '2023-05-20'
  },
  '2': {
    id: 2,
    name: 'TechStart Inc.',
    taxId: 'TSI789012',
    email: 'info@techstart.com',
    phone: '+1 (555) 987-6543',
    address: '456 Innovation Ave, San Francisco, CA',
    status: 'pending',
    accountant_name: 'John Smith',
    created_at: '2023-03-10',
    updated_at: '2023-04-05'
  }
};

// Mock documents data
const mockDocuments = [
  {
    id: 101,
    company_id: 1,
    title: 'Invoice #2023-056',
    type: 'Invoice',
    operation_type: 'Income',
    date: '2025-05-15',
    upload_date: '2025-05-16',
    status: 'pending',
    vendor_client: 'Client XYZ',
    company: 'Acme Corporation',
    preview: '/documents/preview/101.jpg'
  },
  {
    id: 102,
    company_id: 1,
    title: 'Receipt #R789',
    type: 'Receipt',
    operation_type: 'Expense',
    date: '2025-05-12',
    upload_date: '2025-05-13',
    status: 'processed',
    vendor_client: 'Office Supplies Co.',
    company: 'Acme Corporation',
    preview: '/documents/preview/102.jpg'
  },
  {
    id: 103,
    company_id: 1,
    title: 'Bank Statement',
    type: 'Bank Statement',
    operation_type: 'Administrative',
    date: '2025-05-10',
    upload_date: '2025-05-11',
    status: 'processed',
    vendor_client: 'First National Bank',
    company: 'Acme Corporation',
    preview: '/documents/preview/103.jpg'
  },
  {
    id: 104,
    company_id: 1,
    title: 'Contract #C-2023-12',
    type: 'Contract',
    operation_type: 'Administrative',
    date: '2025-05-05',
    upload_date: '2025-05-06',
    status: 'rejected',
    vendor_client: 'Vendor XYZ',
    company: 'Acme Corporation',
    preview: '/documents/preview/104.jpg'
  }
];

// Recent activity data
const recentActivity = [
  { type: 'Document Upload', description: 'Invoice #2023-056 uploaded', date: '2025-05-16', icon: '⬆️', color: 'primary' },
  { type: 'Document Processed', description: 'Receipt #R789 marked as processed', date: '2025-05-13', icon: '✓', color: 'success' },
  { type: 'Profile Update', description: 'Company details updated', date: '2025-05-10', icon: '✏️', color: 'info' }
];

const CompanyDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  
  // In a real app, you would fetch data from API
  const company = mockCompanies[id];
  const documents = mockDocuments.filter(doc => doc.company_id === parseInt(id));
  
  // Stats for the dashboard
  const stats = {
    total: documents.length,
    processed: documents.filter(doc => doc.status === 'processed').length,
    pending: documents.filter(doc => doc.status === 'pending').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length
  };

  // Document action handlers
  const handleProcessDocument = (docId) => {
    console.log(`Processing document ${docId}`);
    // Implementation would go here
  };
  
  const handleDownloadDocument = (docId) => {
    console.log(`Downloading document ${docId}`);
    // Implementation would go here
  };
  
  if (loading) {
    return <LinearProgress />;
  }
  
  if (!company) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Company not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/companies" variant="outlined">
            Back to Companies
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
        elevation={2}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '40%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 100%)',
            transform: 'skewX(-15deg) translateX(10%)'
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {company.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {company.taxId}
              </Typography>
              <Chip
                label={company.status}
                size="small"
                sx={{
                  backgroundColor: company.status === 'active' 
                    ? 'rgba(84, 214, 44, 0.24)'
                    : company.status === 'pending' 
                    ? 'rgba(255, 193, 7, 0.24)'
                    : 'rgba(255, 72, 66, 0.24)',
                  color: company.status === 'active' 
                    ? '#229A16'
                    : company.status === 'pending' 
                    ? '#B78103'
                    : '#B72136',
                  fontWeight: 'bold',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {company.address}
            </Typography>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              component={Link}
              to="/companies"
              sx={{ 
                mr: 2,
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Back to Companies
            </Button>
            
            <Button
              variant="contained"
              component={Link}
              to={`/companies/edit/${id}`}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              Edit Company
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="📄" 
            value={stats.total} 
            title="Total Documents" 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="✓" 
            value={stats.processed} 
            title="Processed" 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="⏳" 
            value={stats.pending} 
            title="Pending" 
            color="warning" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="✗" 
            value={stats.rejected} 
            title="Rejected" 
            color="error" 
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={4}>
        {/* Company Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={1}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              Company Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Legal Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.name}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tax ID
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.taxId}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={company.status}
                  size="small"
                  color={
                    company.status === 'active' ? 'success' :
                    company.status === 'pending' ? 'warning' :
                    'error'
                  }
                  sx={{ textTransform: 'capitalize' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Contact Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.email}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Contact Phone
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.phone || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Address
                </Typography>
                <Typography variant="body1">
                  {company.address || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.2),
                  color: 'secondary.main',
                  width: 40,
                  height: 40,
                  mr: 2
                }}
              >
                👨‍💼
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Assigned Accountant
                </Typography>
                <Typography variant="body1">
                  {company.accountant_name || 'Not assigned'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                component={Link}
                to={`/companies/assign/${company.id}`}
                sx={{ ml: 'auto' }}
              >
                Change
              </Button>
            </Box>
          </Paper>
          
          {/* Recent Documents */}
          <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h5" component="h2" fontWeight="bold">
                Recent Documents
              </Typography>
              <Button 
                component={Link} 
                to={`/documents/${company.id}`} 
                variant="outlined"
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {documents.length > 0 ? (
              <Grid container spacing={3}>
                {documents.slice(0, 4).map((doc) => (
                  <Grid item xs={12} sm={6} key={doc.id}>
                    <DocumentCard 
                      document={doc} 
                      onProcess={handleProcessDocument}
                      onDownload={handleDownloadDocument}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No documents found for this company
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/documents/upload/${company.id}`}
                  sx={{ mt: 2 }}
                >
                  Upload First Document
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={1}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                component={Link}
                to={`/documents/upload/${company.id}`}
                startIcon="⬆️"
              >
                Upload Document
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to={`/documents/${company.id}`}
                startIcon="📄"
              >
                View All Documents
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to={`/companies/assign/${company.id}`}
                startIcon="👨‍💼"
              >
                Assign Accountant
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to={`/companies/edit/${company.id}`}
                startIcon="✏️"
              >
                Edit Company Details
              </Button>
            </Box>
          </Paper>
          
          {/* Company Status */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={1}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              Company Status
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Current Status
              </Typography>
              <Chip
                label={company.status}
                color={
                  company.status === 'active' ? 'success' :
                  company.status === 'pending' ? 'warning' :
                  'error'
                }
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {new Date(company.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {new Date(company.updated_at).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                color={company.status === 'active' ? 'error' : 'success'}
              >
                {company.status === 'active' ? 'Deactivate Company' : 'Activate Company'}
              </Button>
            </Box>
          </Paper>
          
          {/* Recent Activity */}
          <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentActivity.map((activity, index) => (
              <Box 
                key={index}
                sx={{ 
                  py: 2, 
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: (theme) => alpha(theme.palette[activity.color].main, 0.2),
                    color: (theme) => theme.palette[activity.color].main,
                    width: 40,
                    height: 40,
                    mr: 2
                  }}
                >
                  {activity.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">
                    {activity.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.description}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.date).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompanyDetailPage;