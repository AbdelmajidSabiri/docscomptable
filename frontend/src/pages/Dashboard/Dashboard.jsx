import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Divider,
  IconButton,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import { alpha } from '@mui/material/styles';

// Mock document data
const mockDocuments = [
  { 
    id: 101, 
    title: 'Invoice #2023-056', 
    type: 'Invoice', 
    company: 'Acme Corp', 
    date: '2025-05-15', 
    status: 'pending',
    preview: '/documents/preview/101.jpg'
  },
  { 
    id: 102, 
    title: 'Receipt #R789', 
    type: 'Receipt', 
    company: 'TechStart Inc', 
    date: '2025-05-12', 
    status: 'processed',
    preview: '/documents/preview/102.jpg'
  },
  { 
    id: 103, 
    title: 'Contract #C2023-12', 
    type: 'Contract', 
    company: 'Global Enterprises', 
    date: '2025-05-10', 
    status: 'processed',
    preview: '/documents/preview/103.jpg'
  },
  { 
    id: 104, 
    title: 'Bank Statement May 2025', 
    type: 'Statement', 
    company: 'Startup Ventures', 
    date: '2025-05-05', 
    status: 'pending',
    preview: '/documents/preview/104.jpg'
  },
  { 
    id: 105, 
    title: 'Invoice #2023-057', 
    type: 'Invoice', 
    company: 'Acme Corp', 
    date: '2025-05-03', 
    status: 'rejected',
    preview: '/documents/preview/105.jpg'
  },
  { 
    id: 106, 
    title: 'Receipt #R790', 
    type: 'Receipt', 
    company: 'TechStart Inc', 
    date: '2025-05-01', 
    status: 'processed',
    preview: '/documents/preview/106.jpg'
  }
];

// Document Card Component
const DocumentCard = ({ document }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: (theme) => theme.shadows[10],
          backgroundColor: 'black',
          color: 'white',
          '& .document-overlay': {
            opacity: 1
          },
          '& .document-actions': {
            opacity: 1,
            transform: 'translateY(0)'
          },
          '& .document-info': {
            opacity: 0
          },
          '& .document-hover-info': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}
      component={Link}
      to={`/documents/view/${document.id}`}
    >
      {/* Document Preview Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${document.preview || '/api/placeholder/400/300'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          transition: 'opacity 0.3s ease',
          '&:hover': {
            opacity: 0.2
          }
        }}
      />

      {/* Overlay */}
      <Box 
        className="document-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Status Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2
        }}
      >
        <Chip
          label={document.status}
          size="small"
          color={
            document.status === 'processed' ? 'success' :
            document.status === 'pending' ? 'warning' :
            'error'
          }
          sx={{ 
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.65rem',
          }}
        />
      </Box>

      {/* Normal Info */}
      <CardContent
        className="document-info"
        sx={{
          position: 'relative',
          zIndex: 1,
          transition: 'opacity 0.3s ease',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="subtitle1" component="h2" fontWeight="bold" noWrap>
            {document.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {document.type}
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {new Date(document.date).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" fontWeight="medium" noWrap>
            {document.company}
          </Typography>
        </Box>
      </CardContent>

      {/* Hover Info */}
      <Box
        className="document-hover-info"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0,
          transform: 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          color: 'white'
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {document.title}
        </Typography>
        
        <Box sx={{ my: 1 }}>
          <Typography variant="body2" align="center">
            Type: {document.type}
          </Typography>
          <Typography variant="body2" align="center">
            Company: {document.company}
          </Typography>
          <Typography variant="body2" align="center">
            Date: {new Date(document.date).toLocaleDateString()}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          sx={{ 
            mt: 2,
            borderColor: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'white'
            }
          }}
        >
          View Document
        </Button>
      </Box>

      {/* Actions */}
      <Box
        className="document-actions"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 1,
          opacity: 0,
          transform: 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease'
        }}
      >
        <Tooltip title="Process">
          <IconButton
            size="small"
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              marginRight: 1,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/documents/process/${document.id}`;
            }}
          >
            ✓
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton
            size="small"
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
            onClick={(e) => e.preventDefault()}
          >
            ⬇️
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

// Stats Card Component
const StatCard = ({ icon, value, title, color }) => {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: (theme) => theme.shadows[8]
        }
      }}
    >
      <CardContent sx={{ 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            backgroundColor: (theme) => alpha(theme.palette[color].main, 0.2),
            color: (theme) => theme.palette[color].main,
            mb: 2,
            fontSize: '1.5rem'
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Define stats based on user role
  const stats = {
    admin: [
      { title: 'Companies', value: 24, icon: '🏢', color: 'primary' },
      { title: 'Accountants', value: 8, icon: '👨‍💼', color: 'secondary' },
      { title: 'Documents', value: 356, icon: '📄', color: 'info' },
      { title: 'Pending Reviews', value: 5, icon: '⏳', color: 'warning' }
    ],
    accountant: [
      { title: 'My Companies', value: 12, icon: '🏢', color: 'primary' },
      { title: 'Active Documents', value: 128, icon: '📄', color: 'info' },
      { title: 'Pending Reviews', value: 17, icon: '⏳', color: 'warning' }
    ],
    company: [
      { title: 'Documents', value: 34, icon: '📄', color: 'primary' },
      { title: 'Processed', value: 28, icon: '✅', color: 'success' },
      { title: 'Pending', value: 6, icon: '⏳', color: 'warning' }
    ]
  };
  
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Get stats based on user role
  const userStats = stats[user.user.role] || stats.company;
  
  return (
    <Container maxWidth="xl">
      {/* Welcome Header */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 2
        }}
        elevation={0}
      >
        <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome back, {user.user.name}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            {user.user.role === 'admin' && 'Manage your accounting system from your dashboard. Here\'s an overview of your current status.'}
            {user.user.role === 'accountant' && 'Track your client companies and their documents. Everything you need is right here.'}
            {user.user.role === 'company' && 'Manage your accounting documents and stay connected with your accountant.'}
          </Typography>
        </Box>
      </Paper>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {userStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard 
              icon={stat.icon} 
              value={stat.value} 
              title={stat.title} 
              color={stat.color} 
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Recent Documents Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Recent Documents
          </Typography>
          <Button 
            component={Link} 
            to="/documents" 
            variant="outlined"
          >
            View All
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {mockDocuments.map((doc) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <DocumentCard document={doc} />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 5, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          {user.user.role === 'admin' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/companies')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>🏢</Box>
                  <Box>View Companies</Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/accountants')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>👨‍💼</Box>
                  <Box>Manage Accountants</Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/companies/new')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>➕</Box>
                  <Box>Add New Company</Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/documents')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>🔍</Box>
                  <Box>Review Documents</Box>
                </Button>
              </Grid>
            </>
          )}
          
          {user.user.role === 'accountant' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/companies')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>🏢</Box>
                  <Box>My Companies</Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/documents')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>📄</Box>
                  <Box>Review Documents</Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/documents/upload')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>⬆️</Box>
                  <Box>Upload Document</Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/profile')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>👤</Box>
                  <Box>My Profile</Box>
                </Button>
              </Grid>
            </>
          )}
          
          {user.user.role === 'company' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/documents/upload')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>⬆️</Box>
                  <Box>Upload Document</Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/documents')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>📄</Box>
                  <Box>View All Documents</Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/profile')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>👤</Box>
                  <Box>My Profile</Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/accountant')}
                  sx={{ 
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ fontSize: '1.5rem' }}>👨‍💼</Box>
                  <Box>Contact Accountant</Box>
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Recent Activity */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          Recent Activity
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ py: 1 }}>
          {[
            { action: 'Document Upload', details: 'Invoice #INV-2023-056', date: '10 minutes ago', icon: '⬆️', color: 'primary' },
            { action: 'Document Processed', details: 'Receipt #REC-789', date: '2 hours ago', icon: '✓', color: 'success' },
            { action: 'New Comment', details: 'On Invoice #INV-2023-042', date: '3 hours ago', icon: '💬', color: 'info' },
            { action: 'Monthly Report', details: 'May 2025 Report Available', date: '1 day ago', icon: '📊', color: 'secondary' }
          ].map((activity, index) => (
            <Box key={index} sx={{ 
              py: 1.5, 
              display: 'flex', 
              alignItems: 'center',
              borderBottom: index < 3 ? '1px solid' : 'none',
              borderColor: 'divider'
            }}>
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
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="medium">
                  {activity.action}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activity.details}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {activity.date}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="text">
            View All Activity
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;