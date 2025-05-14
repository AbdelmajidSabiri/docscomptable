import { useState, useEffect, useContext } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
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
  LinearProgress
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import useFetch from '../../hooks/useFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DocumentsPage = () => {
  const { companyId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  // Filters
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    document_type: searchParams.get('document_type') || '',
    operation_type: searchParams.get('operation_type') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || ''
  });

  // Data fetching
  const {
    data: company,
    loading: companyLoading,
    error: companyError
  } = useFetch(`${API_URL}/companies/${companyId}`);

  const {
    data: documents,
    loading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments
  } = useFetch(`${API_URL}/documents/company/${companyId}`);

  // Filtered documents
  const [filteredDocs, setFilteredDocs] = useState([]);

  useEffect(() => {
    if (documents) {
      let filtered = [...documents];

      // Apply filters
      if (filters.status) {
        filtered = filtered.filter(doc => doc.status === filters.status);
      }

      if (filters.document_type) {
        filtered = filtered.filter(doc => doc.document_type === filters.document_type);
      }

      if (filters.operation_type) {
        filtered = filtered.filter(doc => doc.operation_type === filters.operation_type);
      }

      if (filters.date_from) {
        const fromDate = new Date(filters.date_from);
        filtered = filtered.filter(doc => new Date(doc.document_date) >= fromDate);
      }

      if (filters.date_to) {
        const toDate = new Date(filters.date_to);
        toDate.setHours(23, 59, 59, 999); // End of day
        filtered = filtered.filter(doc => new Date(doc.document_date) <= toDate);
      }

      setFilteredDocs(filtered);
    }
  }, [documents, filters]);

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

  // Generate document type and operation type options from documents
  const getUniqueValues = (field) => {
    if (!documents) return [];
    const values = [...new Set(documents.map(doc => doc[field]))];
    return values.filter(Boolean); // Remove null/undefined
  };

  const documentTypes = getUniqueValues('document_type');
  const operationTypes = getUniqueValues('operation_type');

  if (companyLoading || documentsLoading) {
    return <LinearProgress />;
  }

  if (companyError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          Error loading company: {companyError.message}
        </Typography>
      </Container>
    );
  }

  if (documentsError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          Error loading documents: {documentsError.message}
        </Typography>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6">Company not found</Typography>
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
              Documents for {company.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and view all accounting documents for this company
            </Typography>
          </Box>
          
          {(user.user.role === 'company' || user.user.role === 'accountant') && (
            <Button
              variant="contained"
              component={Link}
              to={`/documents/upload/${companyId}`}
            >
              Upload Document
            </Button>
          )}
        </Box>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              margin="normal"
              variant="outlined"
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="new">Pending</MenuItem>
              <MenuItem value="processed">Processed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Document Type"
              name="document_type"
              value={filters.document_type}
              onChange={handleFilterChange}
              margin="normal"
              variant="outlined"
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {documentTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Operation Type"
              name="operation_type"
              value={filters.operation_type}
              onChange={handleFilterChange}
              margin="normal"
              variant="outlined"
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {operationTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="From Date"
              name="date_from"
              type="date"
              value={filters.date_from}
              onChange={handleFilterChange}
              margin="normal"
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
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
              margin="normal"
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={resetFilters}
              sx={{ mt: 2 }}
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
        
        {filteredDocs.length > 0 ? (
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
                      
                      {(user.user.role === 'accountant' || user.user.role === 'admin') && 
                       doc.status === 'new' && (
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
            {documents?.length === 0 && user.user.role === 'company' && (
              <Button
                variant="contained"
                component={Link}
                to={`/documents/upload/${companyId}`}
                sx={{ mt: 2 }}
              >
                Upload Your First Document
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DocumentsPage;