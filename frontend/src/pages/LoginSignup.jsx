import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Footer from '../components/Footer';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isWhatsAppLogin, setIsWhatsAppLogin] = useState(false);
  const [isVerifyingWhatsApp, setIsVerifyingWhatsApp] = useState(false);
  
  const [formData, setFormData] = useState({ email: '', password: '', otp: '', newPassword: '', whatsappNumber: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role');
    const authError = params.get('error');

    if (token) {
      localStorage.setItem('token', token);
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } else if (authError) {
      setError('Google Authentication Failed');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const response = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        if (data.userExists) {
          alert('You already have an account! Press OK to go to the login screen.');
          setIsLogin(true);
          return;
        }
        throw new Error(data.message || 'Signup failed');
      }

      if (data.alreadyExists) {
        alert('You already have an account! Press OK to go to your dashboard.');
        localStorage.setItem('token', data.token);
        if (data.user.role === 'admin') navigate('/admin-dashboard');
        else navigate('/user-dashboard');
        return;
      }

      setMessage(data.message);
      setIsVerifyingSignup(true);
    } catch (err) { setError(err.message); }
  };

  const handleVerifySignupSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const response = await fetch('http://localhost:5000/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed');
      
      localStorage.setItem('token', data.token);
      if (data.user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/user-dashboard');
    } catch (err) { setError(err.message); }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.needsVerification) setIsVerifyingSignup(true);
        throw new Error(data.message || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      if (data.user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/user-dashboard');
    } catch (err) { setError(err.message); }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Forgot password failed');
      setMessage(data.message);
      setIsForgotPassword(false);
      setIsResettingPassword(true);
    } catch (err) { setError(err.message); }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp, newPassword: formData.newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Password reset failed');
      setMessage(data.message);
      setIsResettingPassword(false);
      setIsLogin(true);
      setFormData({ ...formData, email: '', password: '', otp: '', newPassword: '' });
    } catch (err) { setError(err.message); }
  };

  const handleWhatsAppSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const response = await fetch('http://localhost:5000/auth/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: formData.whatsappNumber })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
      setMessage(data.message);
      setIsWhatsAppLogin(false);
      setIsVerifyingWhatsApp(true);
    } catch (err) { setError(err.message); }
  };

  const handleWhatsAppVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const response = await fetch('http://localhost:5000/auth/whatsapp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: formData.whatsappNumber, otp: formData.otp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed');
      
      localStorage.setItem('token', data.token);
      if (data.user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/user-dashboard');
    } catch (err) { setError(err.message); }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const resetState = () => {
    setIsWhatsAppLogin(false);
    setIsVerifyingWhatsApp(false);
    setIsVerifyingSignup(false);
    setIsForgotPassword(false);
    setIsResettingPassword(false);
    setIsLogin(true);
    setError('');
    setMessage('');
  };

  const renderForm = () => {
    if (isVerifyingSignup) {
      return (
        <form onSubmit={handleVerifySignupSubmit}>
          <div className="form-group">
            <label className="form-label-clean">Enter OTP sent to {formData.email}</label>
            <input type="text" name="otp" className="form-input-clean" placeholder="6-digit OTP" value={formData.otp} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary-clean">Verify Email</button>
          <div className="auth-links">
             <span onClick={resetState}>Back to Login</span>
          </div>
        </form>
      );
    }

    if (isForgotPassword) {
      return (
        <form onSubmit={handleForgotPasswordSubmit}>
          <div className="form-group">
            <label className="form-label-clean">Email</label>
            <input type="email" name="email" className="form-input-clean" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary-clean">Send OTP</button>
          <div className="auth-links">
             <span onClick={resetState}>Back to Login</span>
          </div>
        </form>
      );
    }

    if (isResettingPassword) {
      return (
        <form onSubmit={handleResetPasswordSubmit}>
          <div className="form-group">
            <label className="form-label-clean">Enter OTP</label>
            <input type="text" name="otp" className="form-input-clean" placeholder="6-digit OTP" value={formData.otp} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label-clean">New Password</label>
            <input type="password" name="newPassword" className="form-input-clean" placeholder="Enter new password" value={formData.newPassword} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary-clean">Reset Password</button>
          <div className="auth-links">
             <span onClick={resetState}>Back to Login</span>
          </div>
        </form>
      );
    }

    if (isWhatsAppLogin) {
      return (
        <form onSubmit={handleWhatsAppSendOtp}>
          <div className="form-group">
            <label className="form-label-clean">WhatsApp Number</label>
            <input type="text" name="whatsappNumber" className="form-input-clean" placeholder="e.g. +91 9876543210" value={formData.whatsappNumber} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary-clean">Send OTP via WhatsApp</button>
          <div className="auth-links" style={{ justifyContent: 'center' }}>
             <span onClick={resetState}>Back to Email Login</span>
          </div>
        </form>
      );
    }

    if (isVerifyingWhatsApp) {
      return (
        <form onSubmit={handleWhatsAppVerifyOtp}>
          <div className="form-group">
            <label className="form-label-clean">Enter WhatsApp OTP</label>
            <input type="text" name="otp" className="form-input-clean" placeholder="6-digit OTP" value={formData.otp} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary-clean">Verify & Login</button>
          <div className="auth-links" style={{ justifyContent: 'center' }}>
             <span onClick={resetState}>Back to Login</span>
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
        <div className="form-group">
          <label className="form-label-clean">Email</label>
          <input 
            type="email" 
            name="email"
            className="form-input-clean" 
            placeholder="Enter your email" 
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label-clean">Password</label>
          <input 
            type="password" 
            name="password"
            className="form-input-clean" 
            placeholder="Enter your password" 
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary-clean">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>

        {isLogin ? (
          <div className="auth-links">
            <span onClick={() => setIsForgotPassword(true)}>Forgot Password?</span>
            <div>
              Don't Have an Account? <span className="highlight-link" onClick={() => setIsLogin(false)}>Sign up</span>
            </div>
          </div>
        ) : (
          <div className="auth-links" style={{ justifyContent: 'center' }}>
            <div>
              Already Have an Account? <span className="highlight-link" onClick={() => setIsLogin(true)}>Sign In</span>
            </div>
          </div>
        )}

        <div className="divider-clean"><span>or</span></div>

        <div className="social-logins">
          <button type="button" className="btn-social" onClick={handleGoogleLogin}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
          </button>
          <button type="button" className="btn-social" onClick={() => setIsWhatsAppLogin(true)}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
          </button>
        </div>
      </form>
    );
  };

  const getTitle = () => {
    if (isVerifyingSignup) return 'Verify Email';
    if (isForgotPassword) return 'Forgot Password';
    if (isResettingPassword) return 'Reset Password';
    if (isWhatsAppLogin) return 'Login with WhatsApp';
    if (isVerifyingWhatsApp) return 'Verify WhatsApp OTP';
    return isLogin ? 'Welcome Back' : 'Create an Account';
  };

  return (
    <div className="page-wrapper">
      <div className="auth-container-clean">
        <Link to="/" className="store-logo-link-clean" style={{ textDecoration: 'none' }}>
          <div className="store-logo-clean">
            RaHa <span className="logo-accent">Creations</span>
          </div>
        </Link>

        <div className="auth-card-clean">
          <h2 className="auth-title-clean">{getTitle()}</h2>
          
          {error && <div className="auth-message error">{error}</div>}
          {message && <div className="auth-message success">{message}</div>}

          {renderForm()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginSignup;
