import { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { documentService } from '../../services/document.service';
import { companyService } from '../../services/company.service';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would have a direct API endpoint to get a document by ID
        // For this implementation, we'll need to get company documents and filter
        
        // First get all companies for current user
        const companies = await companyService.getAll();
        
        // For each company, check documents
        let foundDocument = null;
        let foundCompany = null;
        
        for (const company of companies) {
          const documents = await documentService.getByCompany(company.id);
          const doc = documents.find(d => d.id == id);
          
          if (doc) {
            foundDocument = doc;
            foundCompany = company;
            break;
          }
        }
        
        if (!foundDocument || !foundCompany) {
          throw new Error('Document not found');
        }
        
        setDocument(foundDocument);
        setCompany(foundCompany);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Error loading document. It may have been deleted or you may not have permission to view it.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user]);
  
  if (loading) {
    return <div className="loading">Loading document...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!document || !company) {
    return <div className="error-message">Document not found</div>;
  }
  
  return (
    <div className="document-detail-page">
      <div className="page-header">
        <h1>Document Details</h1>
        <div className="header-actions">
          <Link to={`/documents/${company.id}`} className="btn-secondary">
            Back to Documents
          </Link>
          
          {(user.user.role === 'accountant' || user.user.role === 'admin') && 
           document.status === 'new' && (
            <Link to={`/documents/process/${document.id}`} className="btn-primary">
              Process Document
            </Link>
          )}
        </div>
      </div>
      
      <div className="document-detail-container">
        <div className="document-info-card">
          <h2>Document Information</h2>
          <div className="document-info">
            <div className="info-group">
              <div className="info-item">
                <span className="info-label">Company:</span>
                <span className="info-value">{company.name}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Document Type:</span>
                <span className="info-value">{document.document_type}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Operation Type:</span>
                <span className="info-value">{document.operation_type}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Document Date:</span>
                <span className="info-value">
                  {new Date(document.document_date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Vendor/Client:</span>
                <span className="info-value">{document.vendor_client || 'N/A'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Upload Date:</span>
                <span className="info-value">
                  {new Date(document.upload_date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`status-badge ${document.status}`}>
                  {document.status}
                </span>
              </div>
              
              {document.status !== 'new' && (
                <div className="info-item">
                  <span className="info-label">Processing Date:</span>
                  <span className="info-value">
                    {document.processing_date ? 
                      new Date(document.processing_date).toLocaleDateString() : 
                      'N/A'}
                  </span>
                </div>
              )}
              
              {document.comments && (
                <div className="info-item">
                  <span className="info-label">Comments:</span>
                  <span className="info-value">{document.comments}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="document-preview">
          <h2>Document Preview</h2>
          {document.file_path ? (
            <div className="preview-container">
              <iframe 
                src={document.file_path} 
                title="Document Preview" 
                className="document-iframe"
              />
              <a 
                href={document.file_path} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary"
              >
                Open in New Tab
              </a>
            </div>
          ) : (
            <div className="no-preview">
              No preview available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;