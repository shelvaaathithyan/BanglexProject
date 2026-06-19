import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, MapPin, Mail, ShoppingBag } from 'lucide-react';

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
        <div className="dashboard-hero">
          <h1 className="dashboard-title">Your Dashboard</h1>
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center' }}>Loading profile...</p>
        ) : (
          <div className="dashboard-content">
            {/* Profile Section */}
            <section className="profile-section">
              <h2 className="section-title"><User size={24} /> Profile Details</h2>
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

            {/* Orders Section */}
            <section className="orders-section">
              <h2 className="section-title"><ShoppingBag size={24} /> My Orders</h2>
              <div className="empty-orders">
                <p>You haven't placed any orders yet.</p>
                <button className="btn-shop-now" onClick={() => window.location.href = '/'}>Shop Now</button>
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
