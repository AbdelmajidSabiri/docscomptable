import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notification.service';
import { useState, useEffect } from 'react';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };
  
  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  return (
    <header className="app-header">
      <div className="header-logo">
        <Link to="/">DocsCompta</Link>
      </div>
      
      {user && (
        <div className="header-actions">
          <div className="notifications-dropdown">
            <button 
              className="notification-btn" 
              onClick={toggleNotifications}
            >
              <span className="icon">🔔</span>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className="dropdown-menu">
                <h3>Notifications</h3>
                {notifications.length === 0 ? (
                  <p>No notifications</p>
                ) : (
                  <ul className="notification-list">
                    {notifications.slice(0, 5).map(notification => (
                      <li 
                        key={notification.id} 
                        className={notification.is_read ? 'read' : 'unread'}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="notification-message">
                          {notification.message}
                        </div>
                        <div className="notification-time">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/notifications" className="view-all">
                  View all notifications
                </Link>
              </div>
            )}
          </div>
          
          <div className="user-dropdown">
            <span className="user-name">
              {user.profile ? user.profile.name : user.user.email}
            </span>
            <div className="dropdown-menu">
              <Link to="/profile">Profile</Link>
              <Link to="/settings">Settings</Link>
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;