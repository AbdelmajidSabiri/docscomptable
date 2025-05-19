import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  FolderOpen,
  AssignmentTurnedIn,
  AssignmentLate,
  Pending,
  Business,
  DescriptionOutlined,
  CheckCircleOutline,
  ErrorOutline,
  VisibilityOutlined,
  FileDownloadOutlined
} from '@mui/icons-material';

const ComptableDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    processedDocuments: 0,
    pendingDocuments: 0,
    companies: 0,
    recentDocuments: []
  });

  useEffect(() => {
    // Simulate fetching dashboard data
    setTimeout(() => {
      // Mock data for demonstration
      setStats({
        totalDocuments: 124,
        processedDocuments: 87,
        pendingDocuments: 37,
        companies: 8,
        recentDocuments: [
          {
            id: 1,
            company: 'Tech Solutions Inc.',
            fileName: 'Invoice-2023-11-001.pdf',
            documentType: 'invoice',
            date: '2023-11-15',
            amount: '€2,450.00',
            status: 'new'
          },
          {
            id: 2,
            company: 'Marketing Experts SARL',
            fileName: 'Receipt-October2023.pdf',
            documentType: 'receipt',
            date: '2023-11-12',
            amount: '€1,200.00',
            status: 'processed'
          },
          {
            id: 3,
            company: 'Global Services Ltd',
            fileName: 'Q3-Expenses.pdf',
            documentType: 'expenses',
            date: '2023-11-10',
            amount: '€3,780.00',
            status: 'processed'
          },
          {
            id: 4,
            company: 'Creative Design Agency',
            fileName: 'Supplier-Payment-2023004.pdf',
            documentType: 'invoice',
            date: '2023-11-08',
            amount: '€950.00',
            status: 'new'
          },
          {
            id: 5,
            company: 'Tech Solutions Inc.',
            fileName: 'Payroll-Nov2023.pdf',
            documentType: 'payroll',
            date: '2023-11-05',
            amount: '€8,350.00',
            status: 'rejected'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusChip = (status) => {
    switch (status) {
      case 'new':
        return <Chip label="New" color="info" size="small" />;
      case 'processed':
        return <Chip label="Processed" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, mt: 2 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Welcome, {user?.name || 'Accountant'}
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56, 
                margin: '0 auto 16px' 
              }}>
                <FolderOpen fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.totalDocuments}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Total Documents
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ 
                bgcolor: 'success.main', 
                width: 56, 
                height: 56, 
                margin: '0 auto 16px' 
              }}>
                <AssignmentTurnedIn fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.processedDocuments}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Badge badgeContent={stats.pendingDocuments} color="error" sx={{ width: '100%' }}>
                <Avatar sx={{ 
                  bgcolor: 'warning.main', 
                  width: 56, 
                  height: 56, 
                  margin: '0 auto 16px' 
                }}>
                  <Pending fontSize="large" />
                </Avatar>
              </Badge>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.pendingDocuments}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ 
                bgcolor: 'info.main', 
                width: 56, 
                height: 56, 
                margin: '0 auto 16px' 
              }}>
                <Business fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.companies}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Companies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Documents */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Recent Documents
          </Typography>
          <Button color="primary" variant="outlined">View All Documents</Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="documents table">
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Document</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.recentDocuments.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>{doc.company}</TableCell>
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={<DescriptionOutlined />} 
                      label={doc.documentType} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>{doc.amount}</TableCell>
                  <TableCell>{getStatusChip(doc.status)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="View Document">
                        <IconButton size="small" color="primary">
                          <VisibilityOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small" color="secondary">
                          <FileDownloadOutlined />
                        </IconButton>
                      </Tooltip>
                      {doc.status === 'new' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success">
                              <CheckCircleOutline />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error">
                              <ErrorOutline />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Assigned Companies */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
          My Companies
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Business />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary="Tech Solutions Inc." 
              secondary="12 documents (4 pending)"
            />
            <Button size="small" variant="outlined">View</Button>
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Business />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary="Marketing Experts SARL" 
              secondary="23 documents (0 pending)"
            />
            <Button size="small" variant="outlined">View</Button>
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Business />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary="Global Services Ltd" 
              secondary="8 documents (1 pending)"
            />
            <Button size="small" variant="outlined">View</Button>
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Business />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary="Creative Design Agency" 
              secondary="16 documents (2 pending)"
            />
            <Button size="small" variant="outlined">View</Button>
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default ComptableDashboard; 