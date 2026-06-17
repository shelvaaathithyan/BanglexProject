import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">User Dashboard</h1>
        <p className="auth-subtitle" style={{ textAlign: 'left', marginTop: '1rem' }}>
          Welcome to the common user area. This page will be populated later.
        </p>
        <button onClick={handleLogout} className="btn btn-primary" style={{ width: 'auto', marginTop: '2rem' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
