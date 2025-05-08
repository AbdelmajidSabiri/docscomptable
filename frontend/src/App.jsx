import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for dashboard
  const stats = {
    users: 1243,
    revenue: '$12,456',
    orders: 156,
    conversion: '3.2%'
  };
  
  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Placed an order', time: '2 mins ago' },
    { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '15 mins ago' },
    { id: 3, user: 'Robert Johnson', action: 'Submitted a review', time: '1 hour ago' },
    { id: 4, user: 'Emily Davis', action: 'Canceled subscription', time: '3 hours ago' },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, Admin</span>
          <button className="btn-secondary">Logout</button>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <ul>
          <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</li>
          <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</li>
          <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</li>
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</li>
        </ul>
      </nav>
      
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-container">
            <div className="stats-container">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.users}</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-value">{stats.revenue}</p>
              </div>
              <div className="stat-card">
                <h3>Orders</h3>
                <p className="stat-value">{stats.orders}</p>
              </div>
              <div className="stat-card">
                <h3>Conversion Rate</h3>
                <p className="stat-value">{stats.conversion}</p>
              </div>
            </div>
            
            <div className="activity-container">
              <h2>Recent Activity</h2>
              <ul className="activity-list">
                {recentActivity.map(activity => (
                  <li key={activity.id} className="activity-item">
                    <div className="activity-user">{activity.user}</div>
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-time">{activity.time}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && <div className="placeholder-content">Users management will be implemented here</div>}
        {activeTab === 'orders' && <div className="placeholder-content">Orders management will be implemented here</div>}
        {activeTab === 'settings' && <div className="placeholder-content">Settings will be implemented here</div>}
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App