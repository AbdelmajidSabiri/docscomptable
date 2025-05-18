// DocumentCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './DocumentCard.css';

const DocumentCard = ({ document }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Handle various click events
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
      className="document-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Background image */}
      <div 
        className="document-bg" 
        style={{ backgroundImage: `url(${document.preview || '/api/placeholder/400/300'})` }}
      ></div>
      
      {/* Overlay - appears on hover */}
      <div className="document-overlay"></div>
      
      {/* Status indicator */}
      <div className={`document-status status-${document.status}`}>
        {document.status}
      </div>
      
      {/* Normal content - visible by default */}
      <div className="document-content">
        <div>
          <div className="document-title">{document.title}</div>
          <div className="document-type">{document.type}</div>
        </div>
        
        <div className="document-meta">
          <div className="document-date">{new Date(document.date).toLocaleDateString()}</div>
          <div className="document-company">{document.company}</div>
        </div>
      </div>
      
      {/* Hover content - visible on hover */}
      <div className="document-hover-info">
        <div className="hover-title">{document.title}</div>
        
        <div className="hover-details">
          <div className="hover-detail">Type: {document.type}</div>
          <div className="hover-detail">Company: {document.company}</div>
          <div className="hover-detail">Date: {new Date(document.date).toLocaleDateString()}</div>
          
          {/* Additional details shown on hover */}
          {document.vendor_client && (
            <div className="hover-detail">Vendor/Client: {document.vendor_client}</div>
          )}
          {document.reference && (
            <div className="hover-detail">Reference: {document.reference}</div>
          )}
          {document.amount && (
            <div className="hover-detail">Amount: €{document.amount}</div>
          )}
          {document.operation_type && (
            <div className="hover-detail">Operation: {document.operation_type}</div>
          )}
        </div>
        
        <button className="hover-button">
          View Document
        </button>
      </div>
      
      {/* Action buttons - visible on hover */}
      <div className="document-actions">
        {document.status === 'pending' && (
          <button
            className="action-button"
            onClick={handleProcessClick}
            title="Process"
          >
            ✓
          </button>
        )}
        
        <button
          className="action-button"
          onClick={handleDownloadClick}
          title="Download"
        >
          ⬇️
        </button>
      </div>
    </div>
  );
};

DocumentCard.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    preview: PropTypes.string,
    // Additional optional properties
    vendor_client: PropTypes.string,
    reference: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    operation_type: PropTypes.string
  }).isRequired
};

export default DocumentCard;