import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { documentService } from '../../services/document.service';
import { companyService } from '../../services/company.service';

const DocumentProcessPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    status: 'processed',
    comments: ''
  });
  
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
        
        if (foundDocument.status !== 'new') {
          throw new Error('This document has already been processed');
        }
        
        setDocument(foundDocument);
        setCompany(foundCompany);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err.message || 'Error loading document');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!document) return;
    
    setProcessing(true);
    setError('');
    
    try {
      await documentService.processDocument(
        document.id, 
        formData.status, 
        formData.comments
      );
      
      // Redirect to document detail page
      navigate(`/documents/view/${document.id}`);
    } catch (err) {
      console.error('Error processing document:', err);
      setError(err.response?.data?.message || 'Error processing document');
      setProcessing(false);
    }
  };
  
  // Check if user has permission to process documents
  const canProcess = user.user.role === 'accountant' || user.user.role === 'admin';
  
  if (loading) {
    return <div className="loading">Loading document...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <Link to={`/documents/${company?.id || ''}`} className="btn-secondary">
          Back to Documents
        </Link>
      </div>
    );
  }
  
  if (!canProcess) {
    return (
      <div className="error-container">
        <div className="error-message">You don't have permission to process documents</div>
        <Link to={`/documents/${company?.id || ''}`} className="btn-secondary">
          Back to Documents
        </Link>
      </div>
    );
  }
  
  if (!document || !company) {
    return <div className="error-message">Document not found</div>;
  }
  
  return (
    <div className="document-process-page">
      <div className="page-header">
        <h1>Process Document</h1>
        <div className="header-actions">
          <Link to={`/documents/view/${document.id}`} className="btn-secondary">
            Back to Document
          </Link>
        </div>
      </div>
      
      <div className="process-container">
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
            </div>
          ) : (
            <div className="no-preview">
              No preview available
            </div>
          )}
        </div>
        
        <div className="process-form-container">
          <h2>Process Document</h2>
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          <form onSubmit={handleSubmit} className="process-form">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="processed">Processed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                rows="4"
                placeholder="Add any comments or notes about this document"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Submit'}
              </button>
              <Link 
                to={`/documents/view/${document.id}`} 
                className="btn-secondary"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentProcessPage;