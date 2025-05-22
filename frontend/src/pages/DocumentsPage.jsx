import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Chip,
  Stack,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Search, Download, Visibility, Business, DashboardOutlined, DescriptionOutlined, BarChartOutlined, SettingsOutlined, Upload } from '@mui/icons-material';
import { Link as RouterLink, NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Mock companies
const companies = [
  { id: 1, name: 'Acme Corp', logo: '', color: '#1976d2' },
  { id: 2, name: 'Globex', logo: '', color: '#388e3c' },
  { id: 3, name: 'Initech', logo: '', color: '#fbc02d' },
  { id: 4, name: 'Umbrella', logo: '', color: '#d32f2f' },
];

// Mock documents
const mockDocuments = [
  {
    id: 1,
    file_name: 'facture_hebergement_202405.pdf',
    document_type: 'Facture',
    document_date: '2024-05-02',
    vendor_client: 'Hébergement Cloud Pro',
    status: 'new',
    operation_type: 'Achat',
    reference: '',
    company_id: 1,
    company_name: 'Acme Corp',
    company_logo: '',
  },
  {
    id: 2,
    file_name: 'facture_client_xyz_202404.pdf',
    document_type: 'Facture',
    document_date: '2024-04-18',
    vendor_client: 'Client Entreprise XYZ',
    status: 'processed',
    operation_type: 'Vente',
    reference: '',
    company_id: 2,
    company_name: 'Globex',
    company_logo: '',
  },
  // ... more mock documents ...
];

const statusColors = {
  new: 'info',
  processed: 'success',
  rejected: 'error',
  in_review: 'warning',
  approved: 'success',
  processing: 'warning',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
}

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'processed', label: 'Processed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'in_review', label: 'In Review' },
];

const DocumentsPage = () => {
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Filtered documents
  const filteredDocs = mockDocuments.filter(doc => {
    const matchesCompany = selectedCompany === 'all' || doc.company_id === selectedCompany;
    const matchesSearch =
      !search ||
      doc.file_name.toLowerCase().includes(search.toLowerCase()) ||
      doc.vendor_client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    return matchesCompany && matchesSearch && matchesStatus && matchesType;
  });

  // Quick stats
  const totalDocs = filteredDocs.length;
  const byStatus = filteredDocs.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {});

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setStatusFilter(newValue === 'all' ? 'all' : newValue);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: 0, bgcolor: '#f6f7ed', p: 4 }}>
        {/* Header */}
        <Box sx={{ px: 0, pt: 4, pb: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1f1f1f', mb: 1, letterSpacing: -1 }}>Documents</Typography>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 44,
              mb: 2,
              '& .MuiTabs-indicator': { bgcolor: '#1f1f1f', height: 3, borderRadius: 2 },
            }}
          >
            {statusTabs.map(tab => (
              <Tab
                key={tab.key}
                value={tab.key}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontWeight: 600 }}>{tab.label}</span>
                    <Box sx={{ bgcolor: activeTab === tab.key ? '#1f1f1f' : '#f4f4f4', color: activeTab === tab.key ? '#fff' : '#1f1f1f', borderRadius: 2, px: 1, fontSize: 13, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                      {tab.key === 'all' ? filteredDocs.length : filteredDocs.filter(d => d.status === tab.key).length}
                    </Box>
                  </Box>
                }
                sx={{
                  textTransform: 'none',
                  minHeight: 44,
                  fontWeight: 700,
                  color: '#1f1f1f',
                  fontSize: 16,
                  mr: 2,
                  pb: 0,
                  opacity: activeTab === tab.key ? 1 : 0.7,
                }}
              />
            ))}
          </Tabs>
        </Box>
        {/* Filters Row */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          bgcolor: '#fff',
          p: 2,
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #f4f4f4',
          mt: 0
        }}>
          <TextField
            size="small"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ fontSize: 20, color: '#1f1f1f', mr: 1 }} />
              ),
              style: { fontFamily: 'Inter, sans-serif', fontSize: 15, borderRadius: 20, background: '#f6f7ed' }
            }}
            sx={{
              width: 320,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f6f7ed',
                '& fieldset': {
                  borderColor: '#f4f4f4',
                },
                '&:hover fieldset': {
                  borderColor: '#1f1f1f',
                },
              },
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Company</InputLabel>
            <Select
              value={selectedCompany}
              label="Company"
              onChange={e => setSelectedCompany(e.target.value)}
              startAdornment={<Business sx={{ mr: 1, color: '#1f1f1f' }} />}
              sx={{
                borderRadius: 2,
                bgcolor: '#f6f7ed',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#f4f4f4',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1f1f1f',
                },
              }}
            >
              <MenuItem value="all">All Companies</MenuItem>
              {companies.map(company => (
                <MenuItem key={company.id} value={company.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 22, height: 22, fontSize: 13, bgcolor: company.color }}>{company.name[0]}</Avatar>
                    {company.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 130 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={e => setTypeFilter(e.target.value)}
              sx={{
                borderRadius: 2,
                bgcolor: '#f6f7ed',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#f4f4f4',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1f1f1f',
                },
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Facture">Facture</MenuItem>
              <MenuItem value="Justificatif de paiement">Justificatif de paiement</MenuItem>
              <MenuItem value="Bon de livraison">Bon de livraison</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* DataGrid Table */}
        <Box sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #f4f4f4',
          p: 0,
          mb: 4
        }}>
          <DataGrid
            rows={filteredDocs}
            columns={[
              {
                field: 'company',
                headerName: 'Document',
                flex: 1.6,
                minWidth: 220,
                renderCell: (params) => {
                  const doc = params.row;
                  const company = companies.find(c => c.id === doc.company_id);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, fontSize: 18, bgcolor: company?.color || '#1976d2' }}>
                        {company?.name[0] || '?'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: 15, lineHeight: 1.2 }}>{company?.name || doc.company_name}</Typography>
                        <Typography sx={{ fontWeight: 500, color: '#1f1f1f', fontSize: 14 }}>{doc.file_name}</Typography>
                      </Box>
                    </Box>
                  );
                },
              },
              {
                field: 'document_type',
                headerName: 'Type',
                flex: 0.8,
                minWidth: 100,
                renderCell: (params) => (
                  <Chip label={params.value} size="small" color="primary" sx={{ fontWeight: 600, bgcolor: '#f6f7ed', color: '#1f1f1f' }} />
                ),
              },
              {
                field: 'document_date',
                headerName: 'Date',
                flex: 0.7,
                minWidth: 100,
                renderCell: (params) => (
                  <Typography sx={{ color: '#1f1f1f', fontWeight: 500 }}>{formatDate(params.value)}</Typography>
                ),
              },
              {
                field: 'vendor_client',
                headerName: 'Vendor/Client',
                flex: 1,
                minWidth: 120,
                renderCell: (params) => (
                  <Typography sx={{ color: '#1f1f1f', fontWeight: 500 }}>{params.value}</Typography>
                ),
              },
              {
                field: 'status',
                headerName: 'Status',
                flex: 0.7,
                minWidth: 100,
                renderCell: (params) => {
                  let color = '#bdbdbd', bg = '#f4f4f4';
                  if (params.value === 'new') { color = '#1976d2'; bg = '#e3f2fd'; }
                  if (params.value === 'processed') { color = '#388e3c'; bg = '#e8f5e9'; }
                  if (params.value === 'rejected') { color = '#d32f2f'; bg = '#ffebee'; }
                  if (params.value === 'in_review') { color = '#fbc02d'; bg = '#fffde7'; }
                  return (
                    <Chip label={params.value} size="small" sx={{ fontWeight: 600, bgcolor: bg, color: color, textTransform: 'capitalize' }} />
                  );
                },
              },
              {
                field: 'operation_type',
                headerName: 'Operation',
                flex: 0.8,
                minWidth: 100,
                renderCell: (params) => (
                  <Typography sx={{ color: '#1f1f1f', fontWeight: 500 }}>{params.value}</Typography>
                ),
              },
              // Actions column
              {
                field: 'actions',
                headerName: 'Actions',
                flex: 1,
                minWidth: 120,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" color="primary" startIcon={<Visibility />} sx={{ minWidth: 0, px: 1 }} />
                    <Button size="small" variant="outlined" color="info" startIcon={<Download />} sx={{ minWidth: 0, px: 1 }} />
                    <Button size="small" variant="outlined" color="warning" startIcon={<DescriptionOutlined />} sx={{ minWidth: 0, px: 1 }} />
                    <Button size="small" variant="outlined" color="error" startIcon={<DashboardOutlined />} sx={{ minWidth: 0, px: 1 }} />
                  </Stack>
                ),
              },
            ]}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            disableSelectionOnClick
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: '#f6f7ed',
                fontWeight: 700,
                color: '#1f1f1f',
                borderBottom: '1px solid #f4f4f4',
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#f6f7ed',
                },
              },
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
                borderColor: '#f4f4f4',
              },
              '& .MuiDataGrid-columnHeader': {
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiCheckbox-root': {
                color: '#1f1f1f',
              },
              '& .MuiDataGrid-footerContainer': {
                bgcolor: '#fff',
                borderTop: '1px solid #f4f4f4',
                borderRadius: '0 0 12px 12px',
              },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none !important',
                border: 'none !important',
                boxShadow: 'none !important',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentsPage; 