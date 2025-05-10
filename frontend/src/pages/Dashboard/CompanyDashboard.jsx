import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { companyService } from '../../services/company.service';
import { documentService } from '../../services/document.service';
import { notificationService } from '../../services/notification.service';

const CompanyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [companyData, setCompanyData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.profile) {
          setLoading(false);
          return;
        }
        
        const companyId = user.profile.id;
        
        // Fetch company data
        const company = await companyService.getById(companyId);
        setCompanyData(company);
        
        // Fetch documents
        const docsData = await documentService.getByCompany(companyId);
        setDocuments(docsData);
        
        // Fetch notifications
        const notificationsData = await notificationService.getAll();
        setNotifications(notificationsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }
  
  if (!companyData) {
    return <div>Company profile not found</div>;
  }
  
  // Count documents by status
  const newDocuments = documents.filter(doc => doc.status === 'new').length;
  const processedDocuments = documents.filter(doc => doc.status === 'processed').length;
  const rejectedDocuments = documents.filter(doc => doc.status === 'rejected').length;
  
  return (
    <div className="company-dashboard">
      <h1>Company Dashboard</h1>
      
      <div className="company-info-card">
        <div className="company-header">
          <h2>{companyData.name}</h2>
          <span className={`status-badge ${companyData.status}`}>
            {companyData.status}
          </span>
        </div>
        
        <div className="company-details">
          <div className="detail-item">
            <span className="detail-label">Account Status:</span>
            <span className="detail-value">{companyData.status}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">SIRET:</span>
            <span className="detail-value">{companyData.siret || 'Not provided'}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Accountant:</span>
            <span className="detail-value">{companyData.accountant_name || 'Not assigned'}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Member Since:</span>
            <span className="detail-value">
              {new Date(companyData.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Documents</h3>
          <p className="stat-value">{documents.length}</p>
          <Link to={`/documents/${companyData.id}`} className="card-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-value">{newDocuments}</p>
          <Link to={`/documents/${companyData.id}?status=new`} className="card-link">View Pending</Link>
        </div>
        
        <div className="stat-card">
          <h3>Processed</h3>
          <p className="stat-value">{processedDocuments}</p>
          <Link to={`/documents/${companyData.id}?status=processed`} className="card-link">View Processed</Link>
        </div>
        
        <div className="stat-card">
          <h3>Rejected</h3>
          <p className="stat-value">{rejectedDocuments}</p>
          <Link to={`/documents/${companyData.id}?status=rejected`} className="card-link">View Rejected</Link>
        </div>
      </div>
      
      <div className="action-buttons">
        <Link to={`/documents/upload/${companyData.id}`} className="btn-primary">
          Upload New Document
        </Link>
      </div>
      
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>Recent Documents</h2>
          {documents.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Operation</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.slice(0, 5).map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.document_type}</td>
                    <td>{doc.operation_type}</td>
                    <td>{new Date(doc.document_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${doc.status}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/documents/view/${doc.id}`} className="btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No documents uploaded yet.</p>
          )}
          <div className="section-footer">
            <Link to={`/documents/${companyData.id}`} className="btn-link">View All Documents</Link>
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

export default CompanyDashboard;