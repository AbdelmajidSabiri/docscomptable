import { useState, useEffect, useContext } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { documentService } from '../../services/document.service';
import { companyService } from '../../services/company.service';

const DocumentsPage = () => {
  const { companyId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const [company, setCompany] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    operation_type: searchParams.get('operation_type') || '',
    document_type: searchParams.get('document_type') || ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company data
        const companyData = await companyService.getById(companyId);
        setCompany(companyData);
        
        // Fetch documents with filters
        const docsData = await documentService.getByCompany(companyId, filters);
        setDocuments(docsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId, filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const resetFilters = () => {
    setFilters({
      status: '',
      operation_type: '',
      document_type: ''
    });
  };
  
  // Get unique values for filters
  const getUniqueValues = (field) => {
    const values = [...new Set(documents.map(doc => doc[field]))];
    return values.filter(Boolean); // Remove null/undefined
  };
  
  const operationTypes = getUniqueValues('operation_type');
  const documentTypes = getUniqueValues('document_type');
  
  if (loading) {
    return <div className="loading">Loading documents...</div>;
  }
  
  if (!company) {
    return <div>Company not found</div>;
  }
  
  return (
    <div className="documents-page">
      <div className="page-header">
        <h1>Documents for {company.name}</h1>
        
        {user.user.role === 'company' && (
          <Link to={`/documents/upload/${companyId}`} className="btn-primary">
            Upload New Document
          </Link>
        )}
      </div>
      
      <div className="filters-section">
        <h2>Filters</h2>
        <div className="filters-form">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="new">Pending</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="operation_type">Operation Type</label>
            <select
              id="operation_type"
              name="operation_type"
              value={filters.operation_type}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {operationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="document_type">Document Type</label>
            <select
              id="document_type"
              name="document_type"
              value={filters.document_type}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <button onClick={resetFilters} className="btn-secondary">
            Reset Filters
          </button>
        </div>
      </div>
      
      <div className="documents-list">
        {documents.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Operation</th>
                <th>Date</th>
                <th>Vendor/Client</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.document_type}</td>
                  <td>{doc.operation_type}</td>
                  <td>{new Date(doc.document_date).toLocaleDateString()}</td>
                  <td>{doc.vendor_client || 'N/A'}</td>
                  <td>{new Date(doc.upload_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${doc.status}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/documents/view/${doc.id}`} className="btn-sm">View</Link>
                    {(user.user.role === 'accountant' || user.user.role === 'admin') && 
                     doc.status === 'new' && (
                      <Link to={`/documents/process/${doc.id}`} className="btn-sm">Process</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No documents found. {user.user.role === 'company' && 'Upload your first document!'}</p>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;