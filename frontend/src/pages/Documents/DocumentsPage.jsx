import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Grid,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material';

// Mock documents data
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
  },
  {
    id: 104,
    company_id: 1,
    document_type: 'Contract',
    operation_type: 'Administrative',
    document_date: '2023-04-10',
    upload_date: '2023-04-12',
    status: 'rejected',
    vendor_client: 'Vendor ABC'
  }
];

// Mock company data
const mockCompany = {
  id: 1,
  name: 'Acme Corporation',
  status: 'active'
};

const DocumentsPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Initialize filters with search params or defaults
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    document_type: searchParams.get('document_type') || '',
    operation_type: searchParams.get('operation_type') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || ''
  });
  
  // Apply filters to documents
  const filteredDocs = mockDocuments.filter(doc => {
    // Filter by status
    if (filters.status && doc.status !== filters.status) {
      return false;
    }
    
    // Filter by document type
    if (filters.document_type && doc.document_type !== filters.document_type) {
      return false;
    }
    
    // Filter by operation type
    if (filters.operation_type && doc.operation_type !== filters.operation_type) {
      return false;
    }
    
    // Filter by date range
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      const docDate = new Date(doc.document_date);
      if (docDate < fromDate) {
        return false;
      }
    }
    
    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      toDate.setHours(23, 59, 59, 999); // End of day
      const docDate = new Date(doc.document_date);
      if (docDate > toDate) {
        return false;
      }
    }
    
    return true;
  });
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      document_type: '',
      operation_type: '',
      date_from: '',
      date_to: ''
    });
  };
  
  // Get unique values for select filters
  const documentTypes = [...new Set(mockDocuments.map(doc => doc.document_type))];
  const operationTypes = [...new Set(mockDocuments.map(doc => doc.operation_type))];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Documents for {mockCompany.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and view all accounting documents for this company
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            component={Link}
            to={`/documents/upload/${mockCompany.id}`}
          >
            Upload Document
          </Button>
        </Box>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="new">Pending</MenuItem>
                <MenuItem value="processed">Processed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="document-type-filter-label">Document Type</InputLabel>
              <Select
                labelId="document-type-filter-label"
                id="document-type-filter"
                name="document_type"
                value={filters.document_type}
                onChange={handleFilterChange}
                label="Document Type"
              >
                <MenuItem value="">All</MenuItem>
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="operation-type-filter-label">Operation Type</InputLabel>
              <Select
                labelId="operation-type-filter-label"
                id="operation-type-filter"
                name="operation_type"
                value={filters.operation_type}
                onChange={handleFilterChange}
                label="Operation Type"
              >
                <MenuItem value="">All</MenuItem>
                {operationTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="From Date"
              name="date_from"
              type="date"
              value={filters.date_from}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="To Date"
              name="date_to"
              type="date"
              value={filters.date_to}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={resetFilters}
              fullWidth
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Documents List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Documents ({filteredDocs.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <LinearProgress />
        ) : filteredDocs.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Operation</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Vendor/Client</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.document_type}</TableCell>
                    <TableCell>{doc.operation_type}</TableCell>
                    <TableCell>{new Date(doc.document_date).toLocaleDateString()}</TableCell>
                    <TableCell>{doc.vendor_client || 'N/A'}</TableCell>
                    <TableCell>{new Date(doc.upload_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={doc.status}
                        color={
                          doc.status === 'processed' ? 'success' :
                          doc.status === 'new' ? 'warning' :
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/documents/view/${doc.id}`}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      
                      {doc.status === 'new' && (
                        <Button
                          component={Link}
                          to={`/documents/process/${doc.id}`}
                          variant="outlined"
                          size="small"
                          color="primary"
                        >
                          Process
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No documents found matching the filters.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to={`/documents/upload/${mockCompany.id}`}
              sx={{ mt: 2 }}
            >
              Upload Your First Document
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DocumentsPage;