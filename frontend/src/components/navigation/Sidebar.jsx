import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/navigation/Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null;
  
  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/', icon: '🏠', active: true },
    { name: 'Tasks', path: '/tasks', icon: '📋', count: 2 },
    { name: 'Activity', path: '/activity', icon: '📈' },
    { name: 'Customers', path: '/customers', icon: '👥' },
    { name: 'Settings', path: '/settings', icon: '⚙️' }
  ];

  // Project section
  const projectItems = [
    { name: 'BizConnect', path: '/projects/bizconnect', icon: '⚡', count: 7 },
    { name: 'Growth Hub', path: '/projects/growth-hub', icon: '📊' },
    { name: 'Conversion Path', path: '/projects/conversion-path', icon: '🔄' },
    { name: 'Marketing', path: '/projects/marketing', icon: '📣' }
  ];

  // Team members
  const teamMembers = [
    { name: 'Sandra Perry', role: 'Product Manager', avatar: 'SP' },
    { name: 'Antony Cardenas', role: 'Sales Manager', avatar: 'AC' },
    { name: 'Jamal Connolly', role: 'Growth Marketer', avatar: 'JC' },
    { name: 'Cara Carr', role: 'SEO Specialist', avatar: 'CC' },
    { name: 'Iona Rollins', role: '', avatar: 'IR' }
  ];

  return (
    <div className="sidebar">
      <div className="logo-container">
        <h1 className="logo">BizLink</h1>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.name} className={`nav-item ${item.active ? 'active' : ''}`}>
              <Link to={item.path} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                {item.count && <span className="nav-count">{item.count}</span>}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Projects Section */}
        <div className="sidebar-section">
          <div className="section-header">
            <h2>Projects</h2>
          </div>
          <ul className="section-list">
            {projectItems.map((item) => (
              <li key={item.name} className="section-item">
                <Link to={item.path} className="section-link">
                  <span className="section-icon">{item.icon}</span>
                  <span className="section-text">{item.name}</span>
                  {item.count && <span className="section-count">{item.count}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Members Section */}
        <div className="sidebar-section">
          <div className="section-header">
            <h2>Members</h2>
            <button className="add-member-btn">+</button>
          </div>
          <ul className="members-list">
            {teamMembers.map((member) => (
              <li key={member.name} className="member-item">
                <Link to={`/members/${member.name.toLowerCase().replace(' ', '-')}`} className="member-link">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                  </div>
                  {member.name === 'Iona Rollins' && <div className="external-link">↗️</div>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;