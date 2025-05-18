import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/pages/Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load data if needed
    setLoading(false);
  }, []);

  // Mock data for the dashboard
  const newCustomers = {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    values: [6, 8, 5, 3, 7]
  };

  const kpiData = {
    customers: 53,
    deals: "68%",
    revenue: "$15,890"
  };

  const pipelineStages = [
    { 
      name: "Contacted", count: 12, direction: "up", 
      companies: [
        { 
          name: "ByteBridge", 
          description: "Corporate and personal data protection on a turnkey basis",
          date: "18 Apr",
          stats: { tasks: 2, comments: 1, files: 1, activities: 3 }
        },
        { 
          name: "AI Synergy", 
          description: "Innovative solutions based on artificial intelligence",
          date: "21 Mar",
          stats: { tasks: 1, comments: 3, files: 1, activities: 3 }
        }
      ]
    },
    { 
      name: "Negotiation", count: 17, direction: "down",
      companies: [
        { 
          name: "SkillUp Hub", 
          description: "Platform for professional development of specialists",
          date: "09 Mar",
          stats: { tasks: 4, comments: 1, files: 1, activities: 3 }
        },
        { 
          name: "Thera Well", 
          description: "Platform for psychological support and consultations",
          date: "No due date",
          stats: { tasks: 7, comments: 2, files: 1, activities: 3 }
        }
      ]
    },
    { 
      name: "Offer Sent", count: 13, direction: "down",
      companies: [
        { 
          name: "FitLife Nutrition", 
          description: "Nutritious food and nutraceuticals for individuals",
          date: "10 Mar",
          stats: { tasks: 1, comments: 3, files: 1, activities: 3 }
        },
        { 
          name: "Prime Estate", 
          description: "Agency-developer of low-rise elite and commercial real estate",
          date: "16 Apr",
          stats: { tasks: 1, comments: 1, files: 1, activities: 3 },
          location: "540 Realty Blvd, Miami, FL 33132",
          contact: "contact@primeestate.com",
          manager: "Antony Cardenas"
        }
      ]
    },
    { 
      name: "Deal Closed", count: 12, direction: "up",
      companies: [
        { 
          name: "CloudSphere", 
          description: "Cloud services for data storage and processing for business",
          date: "24 Mar",
          stats: { tasks: 2, comments: 1, files: 1, activities: 3 }
        },
        { 
          name: "Advantage Media", 
          description: "Full cycle of digital advertising and social media promotion",
          date: "05 Apr",
          stats: { tasks: 1, comments: 3, files: 1, activities: 3 }
        },
        { 
          name: "Safebank Solutions", 
          description: "Innovative financial technologies and digital payment systems",
          date: "30 Mar",
          stats: { tasks: 4, comments: 7, files: 1, activities: 3 }
        },
        { 
          name: "NextGen University", 
          description: "",
          date: "",
          stats: { tasks: 0, comments: 0, files: 0, activities: 0 }
        }
      ]
    }
  ];
  
  // Helper function to render the new customers chart
  const renderBarChart = () => {
    const maxValue = Math.max(...newCustomers.values);
    
    return (
      <div className="chart-container">
        <div className="chart-y-labels">
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>
        <div className="chart-bars">
          {newCustomers.days.map((day, index) => (
            <div className="chart-bar-group" key={day}>
              <div 
                className="chart-bar" 
                style={{ 
                  height: `${(newCustomers.values[index] / 10) * 100}%`,
                  backgroundColor: day === 'Thu' ? '#f1f1f1' : '#333'
                }}
              ></div>
              <span className="chart-x-label">{day}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Helper function to render the progress circle (68% successful deals)
  const renderProgressCircle = () => {
    const percentage = parseInt(kpiData.deals);
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="progress-circle-container">
        <svg className="progress-circle" width="120" height="120" viewBox="0 0 120 120">
          <circle
            className="progress-circle-bg"
            cx="60"
            cy="60"
            r="40"
            strokeWidth="8"
            fill="none"
          />
          <circle
            className="progress-circle-bar"
            cx="60"
            cy="60"
            r="40"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="65" textAnchor="middle" className="progress-text">
            {percentage}%
          </text>
        </svg>
        <div className="progress-label">Successful deals</div>
      </div>
    );
  };

  // Helper function to render tasks & prepayments section
  const renderTasksPrepaymentsSection = () => {
    return (
      <div className="tasks-prepayments">
        <div className="task-section">
          <div className="task-header">
            <span>Tasks</span>
            <span>In progress</span>
          </div>
          <div className="task-arrow">→</div>
        </div>
        <div className="prepayment-section">
          <div className="prepayment-header">
            <span>Prepayments</span>
            <span>from customers</span>
          </div>
          <div className="prepayment-arrow">→</div>
        </div>
      </div>
    );
  };

  // Helper function to render the pipeline stage sections
  const renderCompanyCard = (company, stageIndex) => {
    const handleViewCompany = (e, name) => {
      e.stopPropagation();
      // Navigate to company detail page
      console.log(`Viewing company: ${name}`);
      navigate(`/companies/${name.toLowerCase().replace(/\s+/g, '-')}`);
    };

    return (
      <div className="company-card" key={company.name}>
        <div className="company-header">
          <h4>{company.name}</h4>
          <button className="more-options">⋮</button>
        </div>
        <p className="company-description">{company.description}</p>
        
        {company.location && (
          <div className="company-location">
            <span>📍 {company.location}</span>
          </div>
        )}
        
        {company.contact && (
          <div className="company-contact">
            <span>📧 {company.contact}</span>
          </div>
        )}
        
        {company.manager && (
          <div className="company-manager">
            <div className="manager-label">Manager:</div>
            <div className="manager-name">{company.manager}</div>
          </div>
        )}
        
        <div className="company-details">
          <div className="company-date">{company.date}</div>
          <div className="company-metrics">
            <span>{company.stats.tasks}</span> <span>•</span> <span>{company.stats.comments}</span>
          </div>
        </div>

        {/* Hover details - additional details visible on hover */}
        <div className="company-hover-details">
          <div className="hover-title">{company.name}</div>
          
          <div className="hover-details-info">
            <div className="hover-section">
              <h5 className="hover-section-title">Company Info</h5>
              <div className="hover-detail">{company.description}</div>
              {company.location && <div className="hover-detail">📍 {company.location}</div>}
              {company.contact && <div className="hover-detail">📧 {company.contact}</div>}
              {company.manager && <div className="hover-detail">👤 Manager: {company.manager}</div>}
            </div>
            
            <div className="hover-section">
              <h5 className="hover-section-title">Statistics</h5>
              <div className="hover-detail">✓ Tasks: {company.stats.tasks}</div>
              <div className="hover-detail">💬 Comments: {company.stats.comments}</div>
              {company.stats.files > 0 && (
                <div className="hover-detail">📄 Files: {company.stats.files}</div>
              )}
              {company.stats.activities > 0 && (
                <div className="hover-detail">📊 Activities: {company.stats.activities}</div>
              )}
              {company.date && <div className="hover-detail">📅 Due: {company.date}</div>}
            </div>
          </div>
          
          <div className="hover-actions">
            <button 
              className="view-company-button"
              onClick={(e) => handleViewCompany(e, company.name)}
            >
              View Company
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render a pipeline stage
  const renderDealStageSection = (stage, index) => {
    return (
      <div className="pipeline-stage" key={stage.name}>
        <div className="stage-header">
          <h3>{stage.name}</h3>
          <div className="stage-count">
            {stage.count} {stage.direction === "up" ? <span>↑</span> : <span>↓</span>}
          </div>
        </div>
        {stage.companies.map(company => renderCompanyCard(company, index))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="search-section">
          <input type="text" placeholder="Search customer..." className="search-input" />
        </div>
        <div className="actions-section">
          <div className="filter-buttons">
            <button className="sort-button">
              <span>Sort by</span>
              <span className="icon-down">▼</span>
            </button>
            <button className="filter-button">
              <span>Filters</span>
              <span className="icon-filter">⚙️</span>
            </button>
          </div>
          <div className="user-actions">
            <button className="me-button">Me</button>
            <button className="add-customer-button">
              <span className="icon-add">+</span>
              <span>Add customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* New customers section */}
      <div className="dashboard-section">
        <h2 className="section-title">New customers</h2>
        {renderBarChart()}
      </div>
      
      {/* KPI metrics */}
      <div className="kpi-section">
        <div className="kpi-card">
          <h2 className="kpi-value">{kpiData.customers}</h2>
        </div>
        <div className="kpi-card circular">
          {renderProgressCircle()}
        </div>
        <div className="kpi-card">
          <h2 className="kpi-value">{kpiData.revenue}</h2>
        </div>
      </div>
      
      {/* Tasks and prepayments section */}
      {renderTasksPrepaymentsSection()}
      
      {/* Pipeline Stages */}
      <div className="pipeline-container">
        {pipelineStages.map((stage, index) => renderDealStageSection(stage, index))}
      </div>
    </div>
  );
};

export default Dashboard;