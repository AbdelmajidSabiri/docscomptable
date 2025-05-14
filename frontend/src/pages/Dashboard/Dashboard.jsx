import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Mock data for the dashboard
  const stats = {
    admin: [
      { title: 'Companies', value: 24, icon: '🏢' },
      { title: 'Accountants', value: 8, icon: '👨‍💼' },
      { title: 'Documents', value: 356, icon: '📄' },
      { title: 'Pending Approvals', value: 5, icon: '⏳' }
    ],
    accountant: [
      { title: 'My Companies', value: 12, icon: '🏢' },
      { title: 'Active Documents', value: 128, icon: '📄' },
      { title: 'Pending Review', value: 17, icon: '⏳' }
    ],
    company: [
      { title: 'Documents', value: 34, icon: '📄' },
      { title: 'Processed', value: 28, icon: '✅' },
      { title: 'Pending', value: 6, icon: '⏳' }
    ]
  };
  
  // Mock recent activity
  const recentActivity = [
    { id: 1, action: 'Document Upload', details: 'Invoice #INV-2023-056', date: '10 minutes ago' },
    { id: 2, action: 'Document Processed', details: 'Receipt #REC-789', date: '2 hours ago' },
    { id: 3, action: 'New Comment', details: 'On Invoice #INV-2023-042', date: '3 hours ago' },
    { id: 4, action: 'New Notification', details: 'Monthly report ready', date: '1 day ago' }
  ];
  
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
    <Container maxWidth="lg">
      {/* Welcome Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user.user.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user.user.role === 'admin' && 'Manage your entire accounting system from this dashboard.'}
          {user.user.role === 'accountant' && 'Track your client companies and their documents.'}
          {user.user.role === 'company' && 'Manage your accounting documents and stay in touch with your accountant.'}
        </Typography>
      </Paper>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {userStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontSize: '3rem', mb: 1 }}>
                  {stat.icon}
                </Typography>
                <Typography variant="h5" component="div">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {user.user.role === 'admin' && (
            <>
              <Grid item>
                <Button variant="contained" onClick={() => navigate('/companies')}>
                  View Companies
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={() => navigate('/accountants')}>
                  Manage Accountants
                </Button>
              </Grid>
            </>
          )}
          
          {user.user.role === 'accountant' && (
            <>
              <Grid item>
                <Button variant="contained" onClick={() => navigate('/companies')}>
                  My Companies
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={() => navigate('/documents')}>
                  Review Documents
                </Button>
              </Grid>
            </>
          )}
          
          {user.user.role === 'company' && (
            <>
              <Grid item>
                <Button variant="contained" onClick={() => navigate('/documents/upload')}>
                  Upload Document
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={() => navigate('/documents')}>
                  View All Documents
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        
        <List>
          {recentActivity.map((activity) => (
            <Box key={activity.id}>
              <ListItem>
                <ListItemText
                  primary={activity.action}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {activity.details}
                      </Typography>
                      {" - " + activity.date}
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </Box>
          ))}
        </List>
        
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