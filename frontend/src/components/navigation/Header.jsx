import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/navigation/Header.css';

const Header = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null;
  
  return (
    <div className="header">
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
  );
};

export default Header;