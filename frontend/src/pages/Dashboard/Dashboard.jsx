import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

// Mock data for stats
const mockStats = {
  companies: 24,
  accountants: 8, 
  documents: 356,
  pendingReviews: 5
};

// Mock document data
const mockDocuments = [
  { 
    id: 101, 
    title: 'Invoice #2023-056', 
    type: 'Invoice', 
    company: 'Acme Corp', 
    date: '2025-05-15', 
    status: 'pending',
    preview: '/api/placeholder/400/300'
  },
  { 
    id: 102, 
    title: 'Receipt #R789', 
    type: 'Receipt', 
    company: 'TechStart Inc', 
    date: '2025-05-12', 
    status: 'processed',
    preview: '/api/placeholder/400/300'
  },
  { 
    id: 103, 
    title: 'Contract #C2023-12', 
    type: 'Contract', 
    company: 'Global Enterprises', 
    date: '2025-05-10', 
    status: 'processed',
    preview: '/api/placeholder/400/300'
  },
  { 
    id: 104, 
    title: 'Bank Statement May 2025', 
    type: 'Statement', 
    company: 'Startup Ventures', 
    date: '2025-05-05', 
    status: 'pending',
    preview: '/api/placeholder/400/300'
  },
  { 
    id: 105, 
    title: 'Invoice #2023-057', 
    type: 'Invoice', 
    company: 'Acme Corp', 
    date: '2025-05-03', 
    status: 'rejected',
    preview: '/api/placeholder/400/300'
  },
  { 
    id: 106, 
    title: 'Receipt #R790', 
    type: 'Receipt', 
    company: 'TechStart Inc', 
    date: '2025-05-01', 
    status: 'processed',
    preview: '/api/placeholder/400/300'
  }
];

// Document Card Component
const DocumentCard = ({ document }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'processed': return '#2e7d32'; // success green
      case 'pending': return '#ed6c02';   // warning orange
      case 'rejected': return '#d32f2f';  // error red
      default: return '#757575';          // default grey
    }
  };
  
  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: isHovered ? 'black' : 'white',
    color: isHovered ? 'white' : '#333',
    borderRadius: '8px',
    boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' : '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    transform: isHovered ? 'translateY(-5px)' : 'translateY(0)'
  };
  
  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 0.3s ease'
  };
  
  const backgroundStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${document.preview})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.1,
    transition: 'opacity 0.3s ease'
  };
  
  const statusChipStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 2,
    backgroundColor: getStatusColor(document.status),
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };
  
  const contentStyle = {
    position: 'relative',
    zIndex: 1,
    transition: 'opacity 0.3s ease',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
    opacity: isHovered ? 0 : 1
  };
  
  const titleStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  
  const typeStyle = {
    fontSize: '14px',
    color: isHovered ? 'rgba(255,255,255,0.7)' : '#666',
    marginBottom: '16px'
  };
  
  const metaContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px'
  };
  
  const dateStyle = {
    fontSize: '12px',
    color: isHovered ? 'rgba(255,255,255,0.7)' : '#757575'
  };
  
  const companyStyle = {
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  
  const hoverInfoStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    color: 'white'
  };
  
  const hoverTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center'
  };
  
  const hoverDetailStyle = {
    textAlign: 'center',
    marginBottom: '4px',
    fontSize: '14px'
  };
  
  const hoverButtonStyle = {
    marginTop: '16px',
    padding: '6px 16px',
    border: '1px solid white',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    fontSize: '14px'
  };
  
  const actionsStyle = {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    zIndex: 3,
    display: 'flex',
    justifyContent: 'flex-end',
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease'
  };
  
  const actionButtonStyle = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '8px',
    cursor: 'pointer',
    border: 'none',
    fontSize: '14px'
  };
  
  const handleProcessClick = (e) => {
    e.stopPropagation();
    navigate(`/documents/process/${document.id}`);
  };
  
  const handleDownloadClick = (e) => {
    e.stopPropagation();
    // Implementation would go here
    console.log(`Downloading document ${document.id}`);
  };
  
  const handleCardClick = () => {
    navigate(`/documents/view/${document.id}`);
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Background image */}
      <div style={backgroundStyle}></div>
      
      {/* Overlay */}
      <div style={overlayStyle}></div>
      
      {/* Status indicator */}
      <div style={statusChipStyle}>
        {document.status}
      </div>
      
      {/* Normal content - visible by default */}
      <div style={contentStyle}>
        <div>
          <div style={titleStyle}>{document.title}</div>
          <div style={typeStyle}>{document.type}</div>
        </div>
        
        <div style={metaContainerStyle}>
          <div style={dateStyle}>{new Date(document.date).toLocaleDateString()}</div>
          <div style={companyStyle}>{document.company}</div>
        </div>
      </div>
      
      {/* Hover content - visible on hover */}
      <div style={hoverInfoStyle}>
        <div style={hoverTitleStyle}>{document.title}</div>
        
        <div style={{margin: '8px 0'}}>
          <div style={hoverDetailStyle}>Type: {document.type}</div>
          <div style={hoverDetailStyle}>Company: {document.company}</div>
          <div style={hoverDetailStyle}>Date: {new Date(document.date).toLocaleDateString()}</div>
        </div>
        
        <button style={hoverButtonStyle}>
          View Document
        </button>
      </div>
      
      {/* Action buttons - visible on hover */}
      <div style={actionsStyle}>
        {document.status === 'pending' && (
          <button
            style={actionButtonStyle}
            onClick={handleProcessClick}
            title="Process"
          >
            ✓
          </button>
        )}
        
        <button
          style={actionButtonStyle}
          onClick={handleDownloadClick}
          title="Download"
        >
          ⬇️
        </button>
      </div>
    </div>
  );
};

// Stats Card Component
const StatCard = ({ icon, value, title, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getColor = (colorName) => {
    switch(colorName) {
      case 'primary': return '#1976d2';
      case 'secondary': return '#9c27b0';
      case 'success': return '#2e7d32';
      case 'warning': return '#ed6c02';
      case 'info': return '#0288d1';
      default: return '#1976d2';
    }
  };
  
  const mainColor = getColor(color);
  
  const cardStyle = {
    height: '100%',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
    boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' : '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px'
  };
  
  const contentStyle = {
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  };
  
  const avatarStyle = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: `${mainColor}20`,
    color: mainColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    fontSize: '24px'
  };
  
  const valueStyle = {
    fontSize: '28px',
    fontWeight: 'bold'
  };
  
  const titleStyle = {
    fontSize: '14px',
    color: '#666'
  };
  
  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={contentStyle}>
        <div style={avatarStyle}>
          {icon}
        </div>
        <div style={valueStyle}>{value}</div>
        <div style={titleStyle}>{title}</div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Define stats based on user role
  const stats = {
    admin: [
      { title: 'Companies', value: mockStats.companies, icon: '🏢', color: 'primary' },
      { title: 'Accountants', value: mockStats.accountants, icon: '👨‍💼', color: 'secondary' },
      { title: 'Documents', value: mockStats.documents, icon: '📄', color: 'info' },
      { title: 'Pending Reviews', value: mockStats.pendingReviews, icon: '⏳', color: 'warning' }
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 2s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // Get stats based on user role
  const userStats = stats[user.user.role] || stats.company;
  
  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px'
  };
  
  const welcomeHeaderStyle = {
    padding: '32px',
    marginBottom: '32px',
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: 'white',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden'
  };
  
  const welcomeTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px'
  };
  
  const welcomeTextStyle = {
    opacity: 0.8,
    maxWidth: '800px'
  };
  
  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  };
  
  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  };
  
  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold'
  };
  
  const viewAllButtonStyle = {
    padding: '8px 16px',
    border: '1px solid #1976d2',
    borderRadius: '4px',
    color: '#1976d2',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'inline-block'
  };
  
  const documentsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  };
  
  const quickActionsStyle = {
    padding: '24px',
    marginBottom: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
  };
  
  const actionButtonsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '24px'
  };
  
  const quickActionButtonStyle = (isPrimary) => ({
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: isPrimary ? '#1976d2' : 'transparent',
    color: isPrimary ? 'white' : '#333',
    border: isPrimary ? 'none' : '1px solid #ddd',
    textDecoration: 'none'
  });
  
  const actionIconStyle = {
    fontSize: '24px'
  };
  
  const dividerStyle = {
    height: '1px',
    backgroundColor: '#eee',
    border: 'none',
    margin: '16px 0 24px'
  };
  
  const activityStyle = {
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
  };
  
  const activityItemStyle = {
    padding: '16px 0',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #eee'
  };
  
  const activityAvatarStyle = (color) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: `${getColor(color)}20`,
    color: getColor(color),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px'
  });
  
  const activityContentStyle = {
    flexGrow: 1
  };
  
  const activityActionStyle = {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '2px'
  };
  
  const activityDetailsStyle = {
    fontSize: '14px',
    color: '#666'
  };
  
  const activityTimeStyle = {
    fontSize: '12px',
    color: '#999'
  };
  
  const viewAllActivityStyle = {
    display: 'block',
    textAlign: 'center',
    padding: '8px',
    marginTop: '16px',
    color: '#1976d2',
    textDecoration: 'none',
    cursor: 'pointer'
  };
  
  function getColor(colorName) {
    switch(colorName) {
      case 'primary': return '#1976d2';
      case 'secondary': return '#9c27b0';
      case 'success': return '#2e7d32';
      case 'warning': return '#ed6c02';
      case 'info': return '#0288d1';
      case 'error': return '#d32f2f';
      default: return '#1976d2';
    }
  }
  
  const renderQuickActions = () => {
    if (user.user.role === 'admin') {
      return (
        <>
          <div style={actionButtonsContainerStyle}>
            <Link to="/companies" style={quickActionButtonStyle(true)}>
              <div style={actionIconStyle}>🏢</div>
              <div>View Companies</div>
            </Link>
            <Link to="/accountants" style={quickActionButtonStyle(false)}>
              <div style={actionIconStyle}>👨‍💼</div>
              <div>Manage Accountants</div>
            </Link>
            <Link to="/companies/new" style={quickActionButtonStyle(false)}>
              <div style={actionIconStyle}>➕</div>
              <div>Add New Company</div>
            </Link>
            <Link to="/documents" style={quickActionButtonStyle(false)}>
              <div style={actionIconStyle}>🔍</div>
              <div>Review Documents</div>
            </Link>
          </div>
        </>
      );
    } else if (user.user.role === 'accountant') {
      return (
        <>
          <div style={actionButtonsContainerStyle}>
            <Link to="/companies" style={quickActionButtonStyle(true)}>
              <div style={actionIconStyle}>🏢</div>
              <div>My Companies</div>
            </Link>
            <Link to="/documents" style={quickActionButtonStyle(false)}>
              <div style={actionIconStyle}>📄</div>
              <div>Review Documents</div>
            </Link>
            <Link to="/documents/upload" style={quickActionButtonStyle(false)}>
              <div style={actionIconStyle}>⬆️</div>
              <div>Upload Document</div>
            </Link>
            <Link to="/profile" style={quickActionButtonStyle(false)}>
              <div style={actionIconStyle}>👤</div>
              <div>My Profile</div>
            </Link>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div style={actionButtonsContainerStyle}>
            <Link to="/documents/upload" style={quickActionButtonStyle(true)}>
              <div style={actionIconStyle}>⬆️</div>
              <div>Upload Document</div>
            </Link>
            <Link to="/documents" style={quickActionButtonStyle(false)}>
              <div style={actionIconStyle}>📄</div>
              <div>View All Documents</div>
            </Link>
            <Link to="/profile" style={quickActionButtonStyle(false)}>
              <div style={actionIconStyle}>👤</div>
              <div>My Profile</div>
            </Link>
            <Link to="/accountant" style={quickActionButtonStyle(false)}>
              <div style={actionIconStyle}>👨‍💼</div>
              <div>Contact Accountant</div>
            </Link>
          </div>
        </>
      );
    }
  };
  
  return (
    <div style={containerStyle}>
      {/* Welcome Header */}
      <div style={welcomeHeaderStyle}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <div style={welcomeTitleStyle}>
            Welcome back, {user.user.name}!
          </div>
          <div style={welcomeTextStyle}>
            {user.user.role === 'admin' && 'Manage your accounting system from your dashboard. Here\'s an overview of your current status.'}
            {user.user.role === 'accountant' && 'Track your client companies and their documents. Everything you need is right here.'}
            {user.user.role === 'company' && 'Manage your accounting documents and stay connected with your accountant.'}
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div style={statsContainerStyle}>
        {userStats.map((stat, index) => (
          <StatCard 
            key={index}
            icon={stat.icon} 
            value={stat.value} 
            title={stat.title} 
            color={stat.color} 
          />
        ))}
      </div>
      
      {/* Recent Documents Section */}
      <div style={sectionHeaderStyle}>
        <div style={sectionTitleStyle}>Recent Documents</div>
        <Link to="/documents" style={viewAllButtonStyle}>
          View All
        </Link>
      </div>
      
      <div style={documentsGridStyle}>
        {mockDocuments.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
      
      {/* Quick Actions */}
      <div style={quickActionsStyle}>
        <div style={sectionTitleStyle}>Quick Actions</div>
        <hr style={dividerStyle} />
        
        {renderQuickActions()}
      </div>
      
      {/* Recent Activity */}
      <div style={activityStyle}>
        <div style={sectionTitleStyle}>Recent Activity</div>
        <hr style={dividerStyle} />
        
        <div>
          {[
            { action: 'Document Upload', details: 'Invoice #INV-2023-056', date: '10 minutes ago', icon: '⬆️', color: 'primary' },
            { action: 'Document Processed', details: 'Receipt #REC-789', date: '2 hours ago', icon: '✓', color: 'success' },
            { action: 'New Comment', details: 'On Invoice #INV-2023-042', date: '3 hours ago', icon: '💬', color: 'info' },
            { action: 'Monthly Report', details: 'May 2025 Report Available', date: '1 day ago', icon: '📊', color: 'secondary' }
          ].map((activity, index) => (
            <div 
              key={index} 
              style={{
                ...activityItemStyle,
                borderBottom: index < 3 ? '1px solid #eee' : 'none'
              }}
            >
              <div style={activityAvatarStyle(activity.color)}>
                {activity.icon}
              </div>
              <div style={activityContentStyle}>
                <div style={activityActionStyle}>
                  {activity.action}
                </div>
                <div style={activityDetailsStyle}>
                  {activity.details}
                </div>
              </div>
              <div style={activityTimeStyle}>
                {activity.date}
              </div>
            </div>
          ))}
        </div>
        
        <div style={viewAllActivityStyle}>
          View All Activity
        </div>
      </div>
    </div>
  );
};

export default Dashboard;