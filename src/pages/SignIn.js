import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/PulseUp.css';

function SignIn() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Demo sign in - in real app, this would call an API
    console.log('Sign in attempt:', formData);
    setSuccessMessage('Sign in successful! Redirecting...');
    
    // Redirect after 2 seconds (demo)
    setTimeout(() => {
      alert('Welcome to PulseUp! (Demo - Dashboard coming soon)');
    }, 500);
  };

  // Handle Forgot Password
  const handleForgotPassword = () => {
    if (!formData.email) {
      setError('Please enter your email address to reset password');
      return;
    }
    
    setSuccessMessage(`Password reset link sent to ${formData.email}! (Demo)`);
    console.log('Password reset requested for:', formData.email);
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="features-panel">
          <h1>PulseUp</h1>
          <div className="subtitle">OFFICIAL CPUT HEALTH PORTAL</div>
          <div className="description">
            Skip the Queue. Prioritize You.
          </div>
          <p className="description">
            Access campus healthcare. Book consultations, view clinical records, 
            and manage your wellness from any device.
          </p>
          
          <div className="feature-item">
            <h3>⚡ Instant Booking</h3>
            <p>Schedule appointments with campus specialists in under 60 seconds.</p>
          </div>
          
          <div className="feature-item">
            <h3>🔒 Secure Health Vault</h3>
            <p>Your medical history is protected with enterprise-grade encryption.</p>
          </div>
        </div>
        
        <div className="form-panel">
          <h2>Student Sign In</h2>
          <p className="sub">Enter your CPUT credentials to access your dashboard.</p>
          
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>CPUT Student Email</label>
              <input
                type="email"
                name="email"
                placeholder="student_number@mycput.ac.za"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="forgot-link">
              <button type="button" onClick={handleForgotPassword}>
                Forgot Password?
              </button>
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember this device</label>
            </div>
            
            <button type="submit" className="btn-primary">
              Sign In
            </button>
            
            <div className="switch-link">
              New to PulseUp? <Link to="/signup">Create an account</Link>
            </div>
          </form>
          
          <div className="footer">
            © 2025 PulseUp. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;