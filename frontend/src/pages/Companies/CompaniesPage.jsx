import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';

// Mock companies data
const mockCompanies = [
  {
    id: 1,
    name: 'Acme Corporation',
    taxId: 'ACM123456',
    email: 'contact@acme.com',
    status: 'active',
    accountant_id: 1,
    accountant_name: 'Jane Doe'
  },
  {
    id: 2,
    name: 'TechStart Inc.',
    taxId: 'TSI789012',
    email: 'info@techstart.com',
    status: 'pending',
    accountant_id: 2,
    accountant_name: 'John Smith'
  },
  {
    id: 3,
    name: 'Global Enterprises',
    taxId: 'GLE345678',
    email: 'contact@globalent.com',
    status: 'active',
    accountant_id: 1,
    accountant_name: 'Jane Doe'
  },
  {
    id: 4,
    name: 'Startup Ventures',
    taxId: 'STV901234',
    email: 'hello@startupventures.co',
    status: 'inactive',
    accountant_id: null,
    accountant_name: null
  }
];

// Mock accountants data
const mockAccountants = [
  {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@docscompta.com'
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john@docscompta.com'
  }
];

const CompaniesPage = () => {
  const [loading, setLoading] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    accountant: '',
    search: ''
  });
  
  // Apply filters to companies
  const filteredCompanies = mockCompanies.filter(company => {
    // Filter by status
    if (filters.status && company.status !== filters.status) {
      return false;
    }
    
    // Filter by accountant
    if (filters.accountant) {
      if (filters.accountant === 'unassigned' && company.accountant_id !== null) {
        return false;
      } else if (filters.accountant !== 'unassigned' && company.accountant_id !== parseInt(filters.accountant)) {
        return false;
      }
    }
    
    // Filter by search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = company.name.toLowerCase().includes(searchLower);
      const taxIdMatch = company.taxId.toLowerCase().includes(searchLower);
      const emailMatch = company.email.toLowerCase().includes(searchLower);
      
      if (!nameMatch && !taxIdMatch && !emailMatch) {
        return false;
      }
    }
    
    return true;
  });
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      accountant: '',
      search: ''
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Companies
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and view all companies in the system
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            component={Link}
            to="/companies/new"
          >
            Add New Company
          </Button>
        </Box>
      </Paper>
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Companies"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name, Tax ID or Email"
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
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
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="accountant-filter-label">Accountant</InputLabel>
              <Select
                labelId="accountant-filter-label"
                id="accountant-filter"
                name="accountant"
                value={filters.accountant}
                onChange={handleFilterChange}
                label="Accountant"
              >
                <MenuItem value="">All Accountants</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                {mockAccountants.map(accountant => (
                  <MenuItem key={accountant.id} value={accountant.id}>
                    {accountant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Companies List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Companies
          {filteredCompanies && (
            <Typography component="span" variant="subtitle2" color="text.secondary" sx={{ ml: 1 }}>
              ({filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'})
            </Typography>
          )}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <LinearProgress />
        ) : filteredCompanies.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Tax ID</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Accountant</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.taxId}</TableCell>
                    <TableCell>{company.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={company.status}
                        size="small"
                        color={
                          company.status === 'active' ? 'success' :
                          company.status === 'pending' ? 'warning' :
                          'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {company.accountant_name || 'Unassigned'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/companies/${company.id}`}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        component={Link}
                        to={`/documents/${company.id}`}
                        size="small"
                        variant="outlined"
                      >
                        Documents
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No companies found
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/companies/new"
              sx={{ mt: 2 }}
            >
              Add New Company
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CompaniesPage;