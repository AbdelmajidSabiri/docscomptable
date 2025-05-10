import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { documentService } from '../../services/document.service';
import { companyService } from '../../services/company.service';

const DocumentUploadPage = () => {
  const { companyId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    operation_type: '',
    document_type: '',
    document_date: '',
    vendor_client: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const companyData = await companyService.getById(companyId);
        setCompany(companyData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Company not found');
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, [companyId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setError('');
    setUploading(true);
    
    try {
      // Create form data for multipart upload
      const uploadData = new FormData();
      uploadData.append('document', file);
      uploadData.append('company_id', companyId);
      uploadData.append('operation_type', formData.operation_type);
      uploadData.append('document_type', formData.document_type);
      uploadData.append('document_date', formData.document_date);
      uploadData.append('vendor_client', formData.vendor_client);
      
      await documentService.upload(uploadData);
      
      // Redirect to documents page after successful upload
      navigate(`/documents/${companyId}`);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.response?.data?.message || 'Error uploading document');
      setUploading(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading company data...</div>;
  }
  
  if (!company) {
    return <div className="error-message">Company not found</div>;
  }
  
  // Check if user has permission to upload
  const canUpload = user.user.role === 'company' || 
                   user.user.role === 'accountant' || 
                   user.user.role === 'admin';
  
  if (!canUpload) {
    return <div className="error-message">You don't have permission to upload documents</div>;
  }
  
  return (
    <div className="document-upload-page">
      <div className="page-header">
        <h1>Upload Document for {company.name}</h1>
      </div>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="upload-form-container">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="operation_type">Operation Type</label>
            <select
              id="operation_type"
              name="operation_type"
              value={formData.operation_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Operation Type</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Investment">Investment</option>
              <option value="Administrative">Administrative</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="document_type">Document Type</label>
            <select
              id="document_type"
              name="document_type"
              value={formData.document_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Document Type</option>
              <option value="Invoice">Invoice</option>
              <option value="Receipt">Receipt</option>
              <option value="Contract">Contract</option>
              <option value="Bank Statement">Bank Statement</option>
              <option value="Tax Document">Tax Document</option>
              <option value="Report">Report</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="document_date">Document Date</label>
            <input
              type="date"
              id="document_date"
              name="document_date"
              value={formData.document_date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="vendor_client">Vendor/Client</label>
            <input
              type="text"
              id="vendor_client"
              name="vendor_client"
              value={formData.vendor_client}
              onChange={handleInputChange}
              placeholder="Enter vendor or client name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="document">Document File</label>
            <input
              type="file"
              id="document"
              name="document"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              required
            />
            <small>Accepted formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX</small>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadPage;