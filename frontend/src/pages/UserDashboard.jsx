import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, MapPin, Mail, ShoppingBag, Package, Heart, Paintbrush, ShoppingCart, Star, LogOut } from 'lucide-react';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const res = await fetch('http://localhost:5000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            address: data.address || ''
          });
          // If first name exists, start in readonly 'Edit Profile' mode.
          // Otherwise, start in editable 'Save Profile' mode.
          setIsEditing(!data.firstName);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If not currently editing, clicking 'Edit Profile' toggles edit mode on
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setSaveStatus('Saving...');
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setSaveStatus('Profile updated successfully!');
        setIsEditing(false); // Switch back to readonly after saving
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Error saving profile.');
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <main className="dashboard-container">
        {isLoading ? (
          <div className="catalog-loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : (
          <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
              <div className="sidebar-profile">
                <div className="avatar-circle">
                  <User size={24} color="#64748b" />
                </div>
                <div className="sidebar-welcome">
                  <span className="welcome-text">
                    {user?.firstName ? 'Welcome Back,' : 'Welcome'}
                  </span>
                  {user?.firstName && (
                    <span className="welcome-name">
                      {user.firstName} {user.lastName ? `${user.lastName[0]}.` : ''}
                    </span>
                  )}
                </div>
              </div>

              <nav className="sidebar-nav">
                <button 
                  className={`sidebar-nav-item ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <User size={18} /> My Details
                </button>
                <button 
                  className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={18} /> My Orders
                </button>
                <button 
                  className={`sidebar-nav-item ${activeTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('saved')}
                >
                  <Heart size={18} /> My Saved Looks
                </button>
                <button 
                  className={`sidebar-nav-item ${activeTab === 'studio' ? 'active' : ''}`}
                  onClick={() => setActiveTab('studio')}
                >
                  <Paintbrush size={18} /> My Design Studio
                </button>
                <button 
                  className={`sidebar-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cart')}
                >
                  <ShoppingCart size={18} /> My Cart
                  <span className="sidebar-badge">3</span>
                </button>
                <button 
                  className={`sidebar-nav-item ${activeTab === 'points' ? 'active' : ''}`}
                  onClick={() => setActiveTab('points')}
                >
                  <Star size={18} /> My Points
                </button>
                <button 
                  className={`sidebar-nav-item ${activeTab === 'address' ? 'active' : ''}`}
                  onClick={() => setActiveTab('address')}
                >
                  <MapPin size={18} /> My Address
                </button>
                
                <div className="sidebar-divider"></div>
                
                <button 
                  className="sidebar-nav-item text-red"
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <div className="dashboard-main-content">
              {activeTab === 'details' && (
            <section className="profile-section">
              <h2 className="section-title">My Details</h2>
              <p className="section-desc">Complete your profile to enhance your shopping experience.</p>
              
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email (Default)</label>
                  <div className="input-with-icon">
                    <Mail size={18} />
                    <input type="email" value={user?.email || ''} readOnly className="readonly-input" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleChange} 
                      placeholder="Enter your first name" 
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleChange} 
                      placeholder="Enter your last name" 
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <div className="input-with-icon align-top">
                    <MapPin size={18} style={{ marginTop: '12px' }} />
                    <textarea 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      placeholder="Enter your full shipping address"
                      rows="3"
                      disabled={!isEditing}
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="btn-save-profile">
                  {isEditing ? 'Save Profile' : 'Edit Profile'}
                </button>
                {saveStatus && <p className="save-status">{saveStatus}</p>}
              </form>
            </section>
              )}

              {activeTab === 'orders' && (
            <section className="orders-section">
              <h2 className="section-title">My Orders</h2>
              <div className="empty-orders">
                <p>You haven't placed any orders yet.</p>
                <button className="btn-shop-now" onClick={() => window.location.href = '/'}>Shop Now</button>
              </div>
            </section>
              )}
              
              {/* Placeholders for other tabs */}
              {['saved', 'studio', 'cart', 'points', 'address'].includes(activeTab) && (
                <section className="orders-section">
                  <h2 className="section-title">
                    {activeTab === 'saved' && 'My Saved Looks'}
                    {activeTab === 'studio' && 'My Design Studio'}
                    {activeTab === 'cart' && 'My Cart'}
                    {activeTab === 'points' && 'My Points'}
                    {activeTab === 'address' && 'My Address'}
                  </h2>
                  <div className="empty-orders">
                    <p>This section is currently under construction.</p>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
