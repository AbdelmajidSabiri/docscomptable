// DocumentCard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../../styles/DocumentCard.css';

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

  // Format amount with currency if it exists
  const formatAmount = (amount) => {
    if (!amount) return '—';
    return `€${amount}`;
  };

  return (
    <div 
      id={`document-card-${document.id}`}
      className={`document-card ${isHovered ? 'expanded' : 'normal'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Background image */}
      <div 
        className="document-bg" 
        style={{ backgroundImage: `url(${document.preview || '/api/placeholder/400/300'})` }}
      ></div>
      
      {/* Status indicator - always visible */}
      <div className={`document-status status-${document.status}`}>{document.status}</div>
      
      {/* Normal Card Content - Only visible when not hovered */}
      {!isHovered && (
        <div className="document-card-main">
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
        </div>
      )}

      {/* Hover Card Content - Fully replaces normal content when hovered */}
      {isHovered && (
        <div className="document-details-container">
          <div className="document-details-expand">
            <div className="details-main-info">
              <div className="details-title">{document.title}</div>
              <div><span>Type:</span> <span>{document.type}</span></div>
              <div><span>Date:</span> <span>{new Date(document.date).toLocaleDateString()}</span></div>
              <div><span>Company:</span> <span>{document.company}</span></div>
            </div>
            
            <div className="details-separator"></div>
            
            <div className="details-extra-info">
              {document.reference && (
                <div><span>Reference:</span> <span>{document.reference}</span></div>
              )}
              {document.amount !== undefined && (
                <div><span>Amount:</span> <span>{formatAmount(document.amount)}</span></div>
              )}
              {document.operation_type && (
                <div><span>Operation:</span> <span>{document.operation_type}</span></div>
              )}
              {document.vendor_client && (
                <div><span>Vendor/Client:</span> <span>{document.vendor_client}</span></div>
              )}
            </div>

            {/* Action buttons */}
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
        </div>
      )}
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