import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get notifications
        const notificationsRes = await axios.get(`${API_URL}/notifications`);
        setNotifications(notificationsRes.data);
        
        // Get data based on user role
        if (user.user.role === 'admin') {
          // Admin dashboard - get all companies
          const companiesRes = await axios.get(`${API_URL}/companies`);
          setCompanies(companiesRes.data);
          
        } else if (user.user.role === 'accountant') {
          // Accountant dashboard - get assigned companies
          const companiesRes = await axios.get(`${API_URL}/companies`);
          setCompanies(companiesRes.data);
          
        } else if (user.user.role === 'company') {
          // Company dashboard - get own documents
          const companyId = user.profile.id;
          const documentsRes = await axios.get(`${API_URL}/documents/company/${companyId}`);
          setDocuments(documentsRes.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const renderAdminDashboard = () => (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Companies</h3>
          <p className="stat-number">{companies.length}</p>
          <Link to="/companies" className="btn-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <h3>Pending Companies</h3>
          <p className="stat-number">
            {companies.filter(c => c.status === 'pending').length}
          </p>
          <Link to="/companies?status=pending" className="btn-link">View Pending</Link>
        </div>
      </div>
      
      <div className="recent-items">
        <h3>Recent Notifications</h3>
        {notifications.length > 0 ? (
          <ul className="notification-list">
            {notifications.slice(0, 5).map(notification => (
              <li key={notification.id} className={notification.is_read ? 'read' : 'unread'}>
                {notification.message}
                <span className="notification-date">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications</p>
        )}
      </div>
    </div>
  );
  
  const renderAccountantDashboard = () => (
    <div className="accountant-dashboard">
      <h2>Accountant Dashboard</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>My Companies</h3>
          <p className="stat-number">{companies.length}</p>
          <Link to="/companies" className="btn-link">View All</Link>
        </div>
      </div>
      
      <div className="company-list">
        <h3>My Companies</h3>
        {companies.length > 0 ? (
          <ul>
            {companies.map(company => (
              <li key={company.id}>
                <Link to={`/companies/${company.id}`}>{company.name}</Link>
                <Link to={`/documents/${company.id}`} className="btn-sm">Documents</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No companies assigned</p>
        )}
      </div>
      
      <div className="recent-items">
        <h3>Recent Notifications</h3>
        {notifications.length > 0 ? (
          <ul className="notification-list">
            {notifications.slice(0, 5).map(notification => (
              <li key={notification.id} className={notification.is_read ? 'read' : 'unread'}>
                {notification.message}
                <span className="notification-date">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications</p>
        )}
      </div>
    </div>
  );
  
  const renderCompanyDashboard = () => (
    <div className="company-dashboard">
      <h2>Company Dashboard</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Documents</h3>
          <p className="stat-number">{documents.length}</p>
        </div>
        
        <div className="stat-card">
          <h3>Processed</h3>
          <p className="stat-number">
            {documents.filter(d => d.status === 'processed').length}
          </p>
        </div>
        
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">
            {documents.filter(d => d.status === 'new').length}
          </p>
        </div>
      </div>
      
      <div className="action-buttons">
        <Link to={`/documents/upload/${user.profile.id}`} className="btn-primary">
          Upload New Document
        </Link>
        <Link to={`/documents/${user.profile.id}`} className="btn-secondary">
          View All Documents
        </Link>
      </div>
      
      <div className="recent-items">
        <h3>Recent Documents</h3>
        {documents.length > 0 ? (
          <table className="document-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.slice(0, 5).map(doc => (
                <tr key={doc.id}>
                  <td>{doc.operation_type} - {doc.document_type}</td>
                  <td>{new Date(doc.document_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${doc.status}`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No documents uploaded yet</p>
        )}
      </div>
      
      <div className="recent-items">
        <h3>Recent Notifications</h3>
        {notifications.length > 0 ? (
          <ul className="notification-list">
            {notifications.slice(0, 5).map(notification => (
              <li key={notification.id} className={notification.is_read ? 'read' : 'unread'}>
                {notification.message}
                <span className="notification-date">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications</p>
        )}
      </div>
    </div>
  );
  
  if (loading) {
    return <div>Loading dashboard...</div>;
  }
  
  return (
    <div className="dashboard-container">
      {user.user.role === 'admin' && renderAdminDashboard()}
      {user.user.role === 'accountant' && renderAccountantDashboard()}
      {user.user.role === 'company' && renderCompanyDashboard()}
    </div>
  );
};

export default Dashboard;