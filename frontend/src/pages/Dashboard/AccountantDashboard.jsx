import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { companyService } from '../../services/company.service';
import { documentService } from '../../services/document.service';
import { notificationService } from '../../services/notification.service';

const AccountantDashboard = () => {
  const { user } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies assigned to this accountant
        const companiesData = await companyService.getAll();
        setCompanies(companiesData);
        
        // Fetch notifications
        const notificationsData = await notificationService.getAll();
        setNotifications(notificationsData);
        
        // Fetch recent documents from all companies
        if (companiesData.length > 0) {
          const recentDocsPromises = companiesData.slice(0, 3).map(company => 
            documentService.getByCompany(company.id)
          );
          
          const docsResults = await Promise.all(recentDocsPromises);
          
          // Flatten and sort by upload date
          const allDocs = docsResults
            .flat()
            .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
            .slice(0, 10);
            
          setRecentDocuments(allDocs);
        }
        
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
  
  // Count documents by status
  const pendingDocuments = recentDocuments.filter(doc => doc.status === 'new').length;
  const processedDocuments = recentDocuments.filter(doc => doc.status === 'processed').length;
  const rejectedDocuments = recentDocuments.filter(doc => doc.status === 'rejected').length;
  
  return (
    <div className="accountant-dashboard">
      <h1>Accountant Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>My Companies</h3>
          <p className="stat-value">{companies.length}</p>
          <Link to="/companies" className="card-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <h3>Pending Documents</h3>
          <p className="stat-value">{pendingDocuments}</p>
        </div>
        
        <div className="stat-card">
          <h3>Processed</h3>
          <p className="stat-value">{processedDocuments}</p>
        </div>
        
        <div className="stat-card">
          <h3>Rejected</h3>
          <p className="stat-value">{rejectedDocuments}</p>
        </div>
      </div>
      
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>My Companies</h2>
          {companies.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>
                      <span className={`status-badge ${company.status}`}>
                        {company.status}
                      </span>
                    </td>
                    <td>{company.contact_name || 'N/A'}</td>
                    <td>
                      <Link to={`/companies/${company.id}`} className="btn-sm">View</Link>
                      <Link to={`/documents/${company.id}`} className="btn-sm">Documents</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No companies assigned yet.</p>
          )}
        </div>
        
        <div className="dashboard-section">
          <h2>Recent Documents</h2>
          {recentDocuments.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.slice(0, 5).map(doc => {
                  const company = companies.find(c => c.id === doc.company_id);
                  return (
                    <tr key={doc.id}>
                      <td>{company ? company.name : 'Unknown'}</td>
                      <td>{doc.document_type}</td>
                      <td>{new Date(doc.document_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${doc.status}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/documents/view/${doc.id}`} className="btn-sm">View</Link>
                        {doc.status === 'new' && (
                          <Link to={`/documents/process/${doc.id}`} className="btn-sm">Process</Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No documents available.</p>
          )}
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

export default AccountantDashboard;