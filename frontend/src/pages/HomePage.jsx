import React from 'react';
import Navbar from '../components/Navbar';

const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Welcome to RaHa Creations</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Home page content will be added here.
        </p>
      </main>
    </div>
  );
};

export default HomePage;
