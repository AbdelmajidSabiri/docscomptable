import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const RegisterPage = () => {
  const initialFormData = {
    email: '',
    password: '',
    confirmPassword: '',
    role: 'company', // Default role
    name: '',
    siret: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Basic Info, Step 2: Role-specific Info
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleNextStep = (e) => {
    e.preventDefault();
    
    // Validate first step
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    setStep(2);
  };
  
  const handlePrevStep = () => {
    setStep(1);
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate role-specific fields
    if (!formData.name) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    
    if (formData.role === 'company') {
      if (!formData.siret) {
        setError('SIRET number is required');
        setLoading(false);
        return;
      }
      
      if (!formData.address) {
        setError('Address is required');
        setLoading(false);
        return;
      }
      
      if (!formData.contactName) {
        setError('Contact name is required');
        setLoading(false);
        return;
      }
      
      if (!formData.contactEmail) {
        setError('Contact email is required');
        setLoading(false);
        return;
      }
    }
    
    try {
      const success = await register(formData);
      
      if (success) {
        navigate('/');
      } else {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration. Please try again.');
      setLoading(false);
    }
  };
  
  // Render step 1 - Basic Info
  const renderStep1 = () => {
    return (
      <form onSubmit={handleNextStep} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="company">Company</option>
            <option value="accountant">Accountant</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary auth-btn">
            Next
          </button>
        </div>
      </form>
    );
  };
  
  // Render step 2 - Role-specific Info
  const renderStep2 = () => {
    return (
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">
            {formData.role === 'company' ? 'Company Name' : 'Full Name'}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        
        {/* Company-specific fields */}
        {formData.role === 'company' && (
          <>
            <div className="form-group">
              <label htmlFor="siret">SIRET Number</label>
              <input
                type="text"
                id="siret"
                name="siret"
                value={formData.siret}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Company Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactName">Contact Person</label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactPhone">Contact Phone</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </div>
          </>
        )}
        
        {/* Accountant-specific fields */}
        {formData.role === 'accountant' && (
          <>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
              />
            </div>
          </>
        )}
        
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handlePrevStep}>
            Back
          </button>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
    );
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>DocsCompta</h1>
          <h2>Create a new account</h2>
          <div className="step-indicator">
            <div className={`step ${step === 1 ? 'active' : 'completed'}`}>
              <span className="step-number">1</span>
              <span className="step-title">Account</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${step === 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-title">Profile</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;