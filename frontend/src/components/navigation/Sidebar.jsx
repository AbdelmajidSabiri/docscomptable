import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Typography, List, ListItem } from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/navigation/Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null;
  
  // Navigation items based on user role
  const getNavItems = () => {
    const navItems = [
      { name: 'Dashboard', path: '/', icon: '📊' },
    ];
    
    if (user?.user?.role === 'admin') {
      navItems.push(
        { name: 'Tasks', path: '/tasks', icon: '📋', count: 2 },
        { name: 'Activity', path: '/activity', icon: '📈' },
        { name: 'Customers', path: '/companies', icon: '👥' },
        { name: 'Settings', path: '/settings', icon: '⚙️' }
      );
    } else if (user?.user?.role === 'accountant') {
      navItems.push(
        { name: 'Tasks', path: '/tasks', icon: '📋', count: 2 },
        { name: 'Activity', path: '/activity', icon: '📈' },
        { name: 'Customers', path: '/companies', icon: '👥' }
      );
    } else if (user?.user?.role === 'company') {
      navItems.push(
        { name: 'Tasks', path: '/tasks', icon: '📋', count: 2 },
        { name: 'Activity', path: '/activity', icon: '📈' },
        { name: 'Documents', path: '/documents', icon: '📄' }
      );
    }
    
    return navItems;
  };

  // Navigation sections
  const getNavSections = () => {
    const projectItems = [
      { name: 'BizConnect', path: '/projects/bizconnect', icon: '⚡', count: 7 },
      { name: 'Growth Hub', path: '/projects/growth-hub', icon: '📊' },
      { name: 'Conversion Path', path: '/projects/conversion-path', icon: '🔄' },
      { name: 'Marketing', path: '/projects/marketing', icon: '📣' }
    ];
    
    const memberItems = [
      { 
        name: 'Sandra Perry', 
        role: 'Product Manager',
        avatar: 'SP',
        path: '/members/sandra-perry'
      },
      { 
        name: 'Antony Cardenas', 
        role: 'Sales Manager',
        avatar: 'AC',
        path: '/members/antony-cardenas'
      },
      { 
        name: 'Jamal Connolly', 
        role: 'Growth Marketer',
        avatar: 'JC',
        path: '/members/jamal-connolly'
      },
      { 
        name: 'Cara Carr', 
        role: 'SEO Specialist',
        avatar: 'CC',
        path: '/members/cara-carr'
      },
    ];
    
    return [
      {
        title: 'Projects',
        items: projectItems
      },
      {
        title: 'Members',
        items: memberItems,
        type: 'members'
      }
    ];
  };
  
  return (
    <Box className="sidebar">
      <Box className="sidebar-header">
        <Typography variant="h6" className="app-logo">
          BizLink
        </Typography>
      </Box>
      
      <Box className="sidebar-nav">
        <List className="nav-list">
          {getNavItems().map((item) => (
            <ListItem 
              key={item.name}
              component={NavLink}
              to={item.path}
              className="nav-item"
              activeClassName="active"
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
              {item.count && <span className="nav-count">{item.count}</span>}
            </ListItem>
          ))}
        </List>
        
        {getNavSections().map((section) => (
          <Box key={section.title} className="nav-section">
            <Typography variant="subtitle2" className="section-title">
              {section.title}
              {section.type === 'members' && (
                <span className="add-section-item">+</span>
              )}
            </Typography>
            
            <List className={`section-list ${section.type === 'members' ? 'member-list' : ''}`}>
              {section.items.map((item) => (
                <ListItem 
                  key={item.name}
                  component={NavLink}
                  to={item.path}
                  className={`section-item ${section.type === 'members' ? 'member-item' : ''}`}
                  activeClassName="active"
                >
                  {section.type === 'members' ? (
                    <>
                      <div className="member-avatar">{item.avatar}</div>
                      <div className="member-info">
                        <Typography variant="body2" className="member-name">{item.name}</Typography>
                        <Typography variant="caption" className="member-role">{item.role}</Typography>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="section-icon">{item.icon}</span>
                      <span className="section-text">{item.name}</span>
                      {item.count && <span className="section-count">{item.count}</span>}
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Sidebar;