import { useState } from 'react';
import PropTypes from 'prop-types';
import './StatCard.css';

const StatCard = ({ icon, value, title, color = 'primary' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`stat-card stat-${color} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="stat-content">
        <div className={`stat-icon icon-${color}`}>
          {icon}
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'info', 'error'])
};

export default StatCard;