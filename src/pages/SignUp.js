import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/PulseUp.css';

function SignUp() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    studentNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!formData.fullName || !formData.studentNumber || !formData.email) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!formData.email.endsWith('@mycput.ac.za')) {
      setError('Please use a valid CPUT email address (@mycput.ac.za)');
      return;
    }
    
    if (formData.studentNumber.length < 9) {
      setError('Please enter a valid student number');
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!formData.password || !formData.confirmPassword) {
      setError('Please enter a password');
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
    
    if (!agreeTerms) {
      setError('Please agree to the Privacy Policy');
      return;
    }
    
    // Demo account creation
    console.log('Account created:', formData);
    setSuccessMessage('Account created successfully! Redirecting to sign in...');
    
    // Redirect to sign in after 2 seconds
    setTimeout(() => {
      navigate('/signin');
    }, 2000);
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="features-panel">
          <h1>PulseUp</h1>
          <div className="subtitle">STUDENT PORTAL</div>
          <div className="description">
            Join Your Campus PulseUp.
          </div>
          <p className="description">
            Access clinical precision and real-time health services designed 
            exclusively for CPUT students.
          </p>
          
          <div className="feature-item">
            <h3>📅 Real-time Booking</h3>
            <p>Secure your clinic visit in seconds without the physical queue.</p>
          </div>
          
          <div className="feature-item">
            <h3>📊 Digital Health Records</h3>
            <p>Securely access your medical history and test results.</p>
          </div>
          
          <div className="feature-item">
            <h3>⭐ Health Points</h3>
            <p>Earn rewards for wellness check-ups.</p>
          </div>
        </div>
        
        <div className="form-panel">
          <h2>Create Account</h2>
          <p className="sub">
            {step === 1 ? 'Step 1 of 2: Personal Details' : 'Step 2 of 2: Security Details'}
          </p>
          
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <form onSubmit={step === 1 ? handleNext : handleSubmit}>
            {step === 1 ? (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="e.g. Lindokuhle Nanto"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Student Number</label>
                  <input
                    type="text"
                    name="studentNumber"
                    placeholder="218XXXXXXX"
                    value={formData.studentNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>CPUT Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="student@mycput.ac.za"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
                    Must end with @mycput.ac.za
                  </small>
                </div>
                
                <button type="submit" className="btn-primary">
                  Next: Set Password →
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a strong password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    I agree to the Privacy Policy and campus health terms.
                  </label>
                </div>
                
                <button type="submit" className="btn-primary">
                  Create Account
                </button>
                
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                >
                  ← Back to Personal Details
                </button>
              </>
            )}
            
            <div className="switch-link">
              Already have an account? <Link to="/signin">Sign In</Link>
            </div>
          </form>
          
          <div className="footer">
            © 2026 PulseUp. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;