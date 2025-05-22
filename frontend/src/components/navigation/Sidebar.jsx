import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  // State to track which section is expanded
  const [expandedSection, setExpandedSection] = useState(null);
  
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <div className="sidebar">
      <div className="logo-section">
        <h1 className="logo">BizLink</h1>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item active">
            <Link to="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Dashboard</span>
            </Link>
          </li>
          
          <li className="nav-item">
            <Link to="/tasks" className="nav-link">
              <span className="nav-icon">📋</span>
              <span className="nav-text">Tasks</span>
              <span className="nav-badge">2</span>
            </Link>
          </li>
          
          <li className="nav-item">
            <Link to="/activity" className="nav-link">
              <span className="nav-icon">📈</span>
              <span className="nav-text">Activity</span>
            </Link>
          </li>
          
          <li className="nav-item">
            <Link to="/customers" className="nav-link">
              <span className="nav-icon">👥</span>
              <span className="nav-text">Customers</span>
            </Link>
          </li>
          
          <li className="nav-item">
            <Link to="/settings" className="nav-link">
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* Companies Section */}
      <div className="sidebar-section">
        <div className="section-header">
          <h2>Companies</h2>
          <button className="add-button">+</button>
        </div>
        
        <ul className="company-list">
          <li className="company-item">
            <Link to="/companies/1" className="company-link">
              <div className="company-logo">BC</div>
              <div className="company-info">
                <div className="company-name">ByteBridge</div>
                <div className="company-role">Product Manager</div>
              </div>
            </Link>
          </li>
          
          <li className="company-item">
            <Link to="/companies/2" className="company-link">
              <div className="company-logo">SH</div>
              <div className="company-info">
                <div className="company-name">SkillUp Hub</div>
                <div className="company-role">Sales Manager</div>
              </div>
            </Link>
          </li>
          
          <li className="company-item">
            <Link to="/companies/3" className="company-link">
              <div className="company-logo">FN</div>
              <div className="company-info">
                <div className="company-name">FitLife Nutrition</div>
                <div className="company-role">Growth Marketer</div>
              </div>
            </Link>
          </li>
          
          <li className="company-item">
            <Link to="/companies/4" className="company-link">
              <div className="company-logo">CS</div>
              <div className="company-info">
                <div className="company-name">CloudSphere</div>
                <div className="company-role">SEO Specialist</div>
              </div>
            </Link>
          </li>
          
          <li className="company-item">
            <Link to="/companies/5" className="company-link">
              <div className="company-logo">AS</div>
              <div className="company-info">
                <div className="company-name">AI Synergy</div>
                <div className="company-role">Tech Lead</div>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;