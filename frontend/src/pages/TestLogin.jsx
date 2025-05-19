import { useState } from 'react';
import axios from 'axios';

const TestLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    console.log('Using API URL:', API_URL);
    
    try {
      // Direct API call without using context
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      setResult(response.data);
      
      // Store token in localStorage for testing
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Test Login Page</h1>
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Email:
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Password:
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </label>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px 15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {error && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px' }}>
          <h3>Login Successful!</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestLogin; 