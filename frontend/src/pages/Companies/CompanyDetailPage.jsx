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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

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

const mockDocuments = [
  {
    id: 101,
    company_id: 1,
    document_type: 'Invoice',
    operation_type: 'Income',
    document_date: '2023-05-01',
    upload_date: '2023-05-05',
    status: 'processed',
    vendor_client: 'Client XYZ'
  },
  {
    id: 102,
    company_id: 1,
    document_type: 'Receipt',
    operation_type: 'Expense',
    document_date: '2023-04-15',
    upload_date: '2023-04-20',
    status: 'processed',
    vendor_client: 'Office Supplies Co.'
  },
  {
    id: 103,
    company_id: 1,
    document_type: 'Bank Statement',
    operation_type: 'Administrative',
    document_date: '2023-05-01',
    upload_date: '2023-05-10',
    status: 'new',
    vendor_client: 'First National Bank'
  }
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
    pending: documents.filter(doc => doc.status === 'new').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {company.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.secondary">
                {company.taxId}
              </Typography>
              <Chip
                label={company.status}
                size="small"
                color={
                  company.status === 'active' ? 'success' :
                  company.status === 'pending' ? 'warning' :
                  'error'
                }
              />
            </Box>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              component={Link}
              to="/companies"
              sx={{ mr: 2 }}
            >
              Back to Companies
            </Button>
            
            <Button
              variant="contained"
              component={Link}
              to={`/companies/edit/${id}`}
            >
              Edit Company
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Company Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Company Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Legal Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.name}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Tax ID / Registration Number
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.taxId}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contact Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.email}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Contact Phone
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.phone || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.address || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assigned Accountant
                  </Typography>
                  <Typography variant="body1">
                    {company.accountant_name || 'Not assigned'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Document Stats */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Statistics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Documents
                    </Typography>
                    <Typography variant="h4">
                      {stats.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Processed
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {stats.processed}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {stats.pending}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Rejected
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {stats.rejected}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                component={Link}
                to={`/documents/${company.id}`}
              >
                View All Documents
              </Button>
            </Box>
          </Paper>
          
          {/* Recent Documents */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {documents.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Document Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.slice(0, 5).map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.document_type}</TableCell>
                        <TableCell>{new Date(doc.document_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={doc.status}
                            size="small"
                            color={
                              doc.status === 'processed' ? 'success' :
                              doc.status === 'new' ? 'warning' :
                              'error'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            component={Link}
                            to={`/documents/view/${doc.id}`}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
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
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  to={`/documents/upload/${company.id}`}
                >
                  Upload Document
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to={`/documents/${company.id}`}
                >
                  View All Documents
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to={`/companies/assign/${company.id}`}
                >
                  Assign Accountant
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Company Status */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Company Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Status
              </Typography>
              <Chip
                label={company.status}
                color={
                  company.status === 'active' ? 'success' :
                  company.status === 'pending' ? 'warning' :
                  'error'
                }
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Member Since
              </Typography>
              <Typography variant="body2">
                {new Date(company.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body2">
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompanyDetailPage;