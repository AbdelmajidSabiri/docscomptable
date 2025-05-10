import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyService } from '../../services/company.service';
import { accountantService } from '../../services/accountant.service';
import { notificationService } from '../../services/notification.service';

const AdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [companiesData, accountantsData, notificationsData] = await Promise.all([
          companyService.getAll(),
          accountantService.getAll(),
          notificationService.getAll()
        ]);
        
        setCompanies(companiesData);
        setAccountants(accountantsData);
        setNotifications(notificationsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }
  
  // Stats calculations
  const pendingCompanies = companies.filter(c => c.status === 'pending').length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const totalAccountants = accountants.length;
  
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Companies</h3>
          <p className="stat-value">{companies.length}</p>
          <Link to="/companies" className="card-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <h3>Active Companies</h3>
          <p className="stat-value">{activeCompanies}</p>
          <Link to="/companies?status=active" className="card-link">View Active</Link>
        </div>
        
        <div className="stat-card">
          <h3>Pending Companies</h3>
          <p className="stat-value">{pendingCompanies}</p>
          <Link to="/companies?status=pending" className="card-link">View Pending</Link>
        </div>
        
        <div className="stat-card">
          <h3>Accountants</h3>
          <p className="stat-value">{totalAccountants}</p>
          <Link to="/accountants" className="card-link">View All</Link>
        </div>
      </div>
      
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>Recent Companies</h2>
          {companies.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Accountant</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.slice(0, 5).map(company => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>
                      <span className={`status-badge ${company.status}`}>
                        {company.status}
                      </span>
                    </td>
                    <td>{company.accountant_name || 'Not assigned'}</td>
                    <td>
                      <Link to={`/companies/${company.id}`} className="btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No companies registered yet.</p>
          )}
          <div className="section-footer">
            <Link to="/companies" className="btn-link">View All Companies</Link>
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>Recent Notifications</h2>
          {notifications.length > 0 ? (
            <ul className="notification-list">
              {notifications.slice(0, 5).map(notification => (
                <li key={notification.id} className={notification.is_read ? 'read' : 'unread'}>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notifications.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
