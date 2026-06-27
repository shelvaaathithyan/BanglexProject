import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_BASE from '../config/api';
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
  const [savedLooks, setSavedLooks] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart
    const loadCart = () => {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(storedCart);
    };
    loadCart();

    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const updateCartItemQty = (index, newQty) => {
    const currentCart = [...cartItems];
    if (newQty <= 0) {
      currentCart.splice(index, 1);
    } else {
      currentCart[index].quantity = newQty;
    }
    localStorage.setItem('cart', JSON.stringify(currentCart));
    setCartItems(currentCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeCartItem = (index) => {
    const currentCart = [...cartItems];
    currentCart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    setCartItems(currentCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    // Load saved looks
    const saved = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    setSavedLooks(saved);

    const handleUpdate = () => {
      const updated = JSON.parse(localStorage.getItem('savedLooks') || '[]');
      setSavedLooks(updated);
    };
    window.addEventListener('savedLooksUpdated', handleUpdate);
    return () => window.removeEventListener('savedLooksUpdated', handleUpdate);
  }, []);

  const removeSavedLook = (id) => {
    const updated = savedLooks.filter(p => p._id !== id);
    setSavedLooks(updated);
    localStorage.setItem('savedLooks', JSON.stringify(updated));
    window.dispatchEvent(new Event('savedLooksUpdated'));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.email && data.email.toLowerCase() === 'banglexproject@gmail.com') {
            navigate('/admin-dashboard');
            return;
          }
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
      const res = await fetch(`${API_BASE}/auth/profile`, {
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
                      {user.firstName} {user.lastName ? user.lastName : ''}
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
                  {cartItemCount > 0 && <span className="sidebar-badge">{cartItemCount}</span>}
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
                    navigate('/login');
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
                <button className="btn-shop-now" onClick={() => navigate('/')}>Shop Now</button>
              </div>
            </section>
              )}
              
              {activeTab === 'saved' && (
                <section className="orders-section">
                  <h2 className="section-title">My Saved Looks</h2>
                  {savedLooks.length === 0 ? (
                    <div className="empty-orders">
                      <p>You haven't saved any looks yet.</p>
                      <button className="btn-shop-now" onClick={() => navigate('/')}>Discover Styles</button>
                    </div>
                  ) : (
                    <div className="popular-products-grid" style={{ marginTop: '1rem' }}>
                      {savedLooks.map((product) => (
                        <div key={product._id} className="product-card">
                          <Link to={`/product/${product._id}`} className="product-image-wrapper">
                            <img 
                              src={product.images?.[0] || 'https://via.placeholder.com/300'} 
                              alt={product.name} 
                              className="product-image"
                            />
                          </Link>
                          <div className="heart-btn" onClick={() => removeSavedLook(product._id)}>
                            <Heart size={18} fill="#e11d48" color="#e11d48" />
                          </div>
                          <div className="product-info">
                            <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                              <h3 className="product-name">{product.name}</h3>
                            </Link>
                            <div className="product-price-row">
                              <span className="sale-price">₹{product.salePrice ? product.salePrice.toFixed(2) : product.price.toFixed(2)}</span>
                            </div>
                            <button 
                              className="btn-primary" 
                              onClick={() => navigate(`/product/${product._id}`)}
                              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
              
              {activeTab === 'cart' && (
                <section className="orders-section">
                  <h2 className="section-title">My Cart</h2>
                  {cartItems.length === 0 ? (
                    <div className="empty-orders">
                      <p>Your cart is empty.</p>
                      <button className="btn-shop-now" onClick={() => navigate('/')}>Shop Now</button>
                    </div>
                  ) : (
                    <div className="cart-content" style={{ marginTop: '1rem' }}>
                      <div className="cart-items">
                        {cartItems.map((item, idx) => (
                          <div key={`${item._id}-${item.size}-${item.color}-${idx}`} className="cart-item" style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div className="cart-item-img-wrapper" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            </div>
                            <div className="cart-item-info" style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: '#1e293b' }}>{item.name}</h4>
                              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                                {item.size && <span>Size: {item.size} </span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </p>
                              <div className="cart-item-qty" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div className="qty-controls" style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                                  <button onClick={() => updateCartItemQty(idx, item.quantity - 1)} style={{ padding: '0.25rem 0.75rem', background: '#f8fafc', border: 'none', cursor: 'pointer' }}>-</button>
                                  <span style={{ padding: '0.25rem 0.75rem', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                                  <button onClick={() => updateCartItemQty(idx, item.quantity + 1)} style={{ padding: '0.25rem 0.75rem', background: '#f8fafc', border: 'none', cursor: 'pointer' }}>+</button>
                                </div>
                                <button onClick={() => removeCartItem(idx)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>Remove</button>
                              </div>
                            </div>
                            <div className="cart-item-price" style={{ fontWeight: '600', color: '#1e293b' }}>
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="cart-summary" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: '600', fontSize: '1.25rem' }}>
                          <span>Subtotal</span>
                          <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>Shipping, taxes, and discounts calculated at checkout.</p>
                        <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                          Proceed to Checkout
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
              
              {/* Placeholders for other tabs */}
              {['studio', 'points', 'address'].includes(activeTab) && (
                <section className="orders-section">
                  <h2 className="section-title">
                    {activeTab === 'studio' && 'My Design Studio'}
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
