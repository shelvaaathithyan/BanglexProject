import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Footer from '../components/Footer';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  const [formData, setFormData] = useState({ email: '', password: '', otp: '', newPassword: '' });
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
      setFormData({ email: '', password: '', otp: '', newPassword: '' });
    } catch (err) { setError(err.message); }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const renderForm = () => {
    if (isVerifyingSignup) {
      return (
        <form onSubmit={handleVerifySignupSubmit}>
          <div className="form-group">
            <label className="form-label">Enter OTP sent to {formData.email}</label>
            <input type="text" name="otp" className="form-input" placeholder="6-digit OTP" value={formData.otp} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary">Verify Email</button>
          <div className="auth-toggle" style={{ justifyContent: 'center' }}>
             <span onClick={() => setIsVerifyingSignup(false)}>Back</span>
          </div>
        </form>
      );
    }

    if (isForgotPassword) {
      return (
        <form onSubmit={handleForgotPasswordSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary">Send OTP</button>
          <div className="auth-toggle" style={{ justifyContent: 'center' }}>
             <span onClick={() => {setIsForgotPassword(false); setIsLogin(true);}}>Back to Login</span>
          </div>
        </form>
      );
    }

    if (isResettingPassword) {
      return (
        <form onSubmit={handleResetPasswordSubmit}>
          <div className="form-group">
            <label className="form-label">Enter OTP</label>
            <input type="text" name="otp" className="form-input" placeholder="6-digit OTP" value={formData.otp} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" name="newPassword" className="form-input" placeholder="Enter new password" value={formData.newPassword} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary">Reset Password</button>
          <div className="auth-toggle" style={{ justifyContent: 'center' }}>
             <span onClick={() => {setIsResettingPassword(false); setIsLogin(true);}}>Back to Login</span>
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            name="email"
            className="form-input" 
            placeholder="Enter your email" 
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            name="password"
            className="form-input" 
            placeholder="Enter your password" 
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {isLogin ? 'Sign In' : 'Get Started'}
        </button>

        {isLogin ? (
          <div className="auth-toggle">
            <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }} onClick={() => setIsForgotPassword(true)}>Forgot Password?</span>
            <div>
              Don't Have an Account? <span className="highlight-red" onClick={() => setIsLogin(false)}>Sign up</span>
            </div>
          </div>
        ) : (
          <div className="auth-toggle" style={{ justifyContent: 'center' }}>
            <div>
              Already Have an Account? <span onClick={() => setIsLogin(true)}>Log in</span>
            </div>
          </div>
        )}

        <div className="divider">or</div>

        <button type="button" className="btn btn-google" onClick={handleGoogleLogin}>
          <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      </form>
    );
  };

  const getTitle = () => {
    if (isVerifyingSignup) return 'Verify Email';
    if (isForgotPassword) return 'Forgot Password';
    if (isResettingPassword) return 'Reset Password';
    return isLogin ? 'Welcome Back' : 'Get started for free';
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        {/* Brand Logo linked to homepage */}
        <Link to="/" className="store-logo-link" style={{ textDecoration: 'none' }}>
          <div className="temp-logo store-logo">
            RaHa <span className="logo-accent">Creations</span>
          </div>
        </Link>

        <div className="glass-card">
          <h2 className="auth-title">{getTitle()}</h2>
          
          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
          {message && <div style={{ color: '#10b981', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{message}</div>}

          {renderForm()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginSignup;
