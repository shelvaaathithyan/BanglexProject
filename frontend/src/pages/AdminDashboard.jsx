import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title" style={{ background: 'linear-gradient(to right, #f43f5e, #fb923c)', WebkitBackgroundClip: 'text' }}>
          Admin Dashboard
        </h1>
        <p className="auth-subtitle" style={{ textAlign: 'left', marginTop: '1rem' }}>
          Welcome, Administrator. This page will be populated later.
        </p>
        <button onClick={handleLogout} className="btn btn-primary" style={{ width: 'auto', marginTop: '2rem', background: '#f43f5e' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
