import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_BASE from '../config/api';
import ReviewModal from '../components/reviews/ReviewModal';
import { User, MapPin, Mail, ShoppingBag, Package, Heart, Paintbrush, ShoppingCart, Star, LogOut } from 'lucide-react';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    mobileNumber: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [savedLooks, setSavedLooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    houseNo: '', street: '', area: '', city: '', state: '', pincode: '', landmark: '', addressType: 'Home'
  });
  const navigate = useNavigate();

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewContext, setReviewContext] = useState({ productId: null, orderId: null, productName: '' });

  const openReviewModal = (productId, orderId, productName) => {
    setReviewContext({ productId, orderId, productName });
    setIsReviewModalOpen(true);
  };

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
            address: data.address || '',
            mobileNumber: data.mobileNumber || ''
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

    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/payments/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          console.log('Fetched Orders:', data);
          setOrders(data);
        } else {
          console.error('Failed to fetch orders, status:', res.status);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };

    fetchUser();
    fetchOrders();

    window.addEventListener('reviewSubmitted', fetchOrders);
    return () => window.removeEventListener('reviewSubmitted', fetchOrders);
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

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const updatedAddresses = [...(user?.addresses || []), addressForm];
    
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addresses: updatedAddresses })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setShowAddressForm(false);
        setAddressForm({ houseNo: '', street: '', area: '', city: '', state: '', pincode: '', landmark: '', addressType: 'Home' });
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to save address');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving address');
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    const token = localStorage.getItem('token');
    const updatedAddresses = (user?.addresses || []).filter((_, i) => i !== index);
    
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addresses: updatedAddresses })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } catch (err) {
      console.error(err);
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
                  {savedLooks.length > 0 && <span className="sidebar-badge">{savedLooks.length}</span>}
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

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Mobile Number</label>
                  <input 
                    type="tel" 
                    name="mobileNumber" 
                    value={formData.mobileNumber} 
                    onChange={handleChange} 
                    placeholder="Enter your mobile number" 
                    disabled={!isEditing}
                  />
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
                  {selectedOrder ? (
                    // Order detail / tracking view
                    <div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#e11d48', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem', padding: 0 }}
                      >
                        &#8592; Back to My Orders
                      </button>

                      {/* Order Header */}
                      <div style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', borderRadius: '12px', padding: '1.5rem', color: 'white', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '0.25rem' }}>ORDER NUMBER</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>#{selectedOrder.orderNumber}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.25rem' }}>Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '0.25rem' }}>TOTAL AMOUNT</div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>&#8377;{selectedOrder.grandTotal?.toFixed(2)}</div>
                            <span style={{ display: 'inline-block', marginTop: '0.25rem', padding: '0.2rem 0.75rem', borderRadius: '99px', background: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', fontWeight: 600 }}>{selectedOrder.paymentStatus}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Status + Timeline */}
                      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Delivery Tracking</h3>

                        {/* Status steps bar */}
                        {(() => {
                          const allSteps = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];
                          const currentIdx = allSteps.indexOf(selectedOrder.orderStatus);
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', overflowX: 'auto', gap: 0 }}>
                              {allSteps.map((step, idx) => {
                                const done = currentIdx >= idx;
                                const active = currentIdx === idx;
                                return (
                                  <React.Fragment key={step}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? '#e11d48' : '#e2e8f0', border: active ? '3px solid #e11d48' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                                        {done ? <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>&#10003;</span> : <span style={{ background: '#cbd5e1', width: '8px', height: '8px', borderRadius: '50%', display: 'block' }}></span>}
                                      </div>
                                      <div style={{ fontSize: '0.65rem', color: done ? '#e11d48' : '#94a3b8', fontWeight: done ? 600 : 400, marginTop: '0.4rem', textAlign: 'center', lineHeight: 1.3 }}>{step}</div>
                                    </div>
                                    {idx < allSteps.length - 1 && (
                                      <div style={{ flex: 1, height: '2px', background: currentIdx > idx ? '#e11d48' : '#e2e8f0', minWidth: '20px', transition: 'background 0.3s' }}></div>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {/* Current status badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px', marginBottom: '1rem' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e11d48', flexShrink: 0 }}></div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#e11d48', fontSize: '0.95rem' }}>Current Status: {selectedOrder.orderStatus}</div>
                            {selectedOrder.orderStatus === 'Cancelled' && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>This order has been cancelled.</div>}
                          </div>
                        </div>

                        {/* Timeline */}
                        {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                          <div style={{ position: 'relative', paddingLeft: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>FULL TIMELINE</div>
                            {[...selectedOrder.timeline].reverse().map((step, idx) => (
                              <div key={idx} style={{ position: 'relative', marginBottom: '1rem' }}>
                                <div style={{ position: 'absolute', left: '-1.5rem', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: idx === 0 ? '#e11d48' : '#cbd5e1', border: '2px solid white', boxShadow: '0 0 0 2px ' + (idx === 0 ? '#e11d48' : '#cbd5e1') }}></div>
                                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem' }}>
                                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: idx === 0 ? '#e11d48' : '#1e293b' }}>{step.status}</div>
                                  {step.note && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{step.note}</div>}
                                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>{step.timestamp ? new Date(step.timestamp).toLocaleString('en-IN') : ''}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Order Items</h3>
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', marginBottom: idx < selectedOrder.items.length - 1 ? '1rem' : 0, borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            {item.product?.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.name} style={{ width: 60, height: 60, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 60, height: 60, borderRadius: '8px', background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#94a3b8' }}>No IMG</div>
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name || item.product?.name || 'Product'}</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Qty: {item.quantity}{item.size ? ` | Size: ${item.size}` : ''}{item.color ? ` | ${item.color}` : ''}</div>
                              {selectedOrder.orderStatus === 'Delivered' && item.product && (
                                <OrderReviewButton productId={item.product._id} orderId={selectedOrder._id} productName={item.product.name} onOpenModal={openReviewModal} />
                              )}
                            </div>
                            <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>&#8377;{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                          </div>
                        ))}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                          <span>Grand Total</span>
                          <span style={{ color: '#e11d48' }}>&#8377;{selectedOrder.grandTotal?.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {selectedOrder.shippingAddress && (
                        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Shipping Address</h3>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.7 }}>
                            {[selectedOrder.shippingAddress.houseNo, selectedOrder.shippingAddress.street, selectedOrder.shippingAddress.area, selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.state, selectedOrder.shippingAddress.pincode].filter(Boolean).join(', ')}
                            {selectedOrder.shippingAddress.landmark && <div>Landmark: {selectedOrder.shippingAddress.landmark}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Orders list view
                    <div>
                      <h2 className="section-title">My Orders</h2>
                      {orders.length === 0 ? (
                        <div className="empty-orders">
                          <p>You haven't placed any orders yet.</p>
                          <button className="btn-shop-now" onClick={() => navigate('/home')}>Shop Now</button>
                        </div>
                      ) : (
                        <div className="orders-list" style={{ marginTop: '1rem' }}>
                          {orders.map(order => (
                            <div
                              key={order._id}
                              className="order-card"
                              onClick={() => setSelectedOrder(order)}
                              style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(225,29,72,0.08)'; e.currentTarget.style.borderColor = '#fda4af'; }}
                              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                <div>
                                  <strong>Order #{order.orderNumber}</strong>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Placed on: {new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: order.paymentStatus === 'Completed' ? '#dcfce7' : '#fee2e2', color: order.paymentStatus === 'Completed' ? '#166534' : '#991b1b' }}>{order.paymentStatus}</span>
                                  <div style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>&#8377;{order.grandTotal?.toFixed(2)}</div>
                                </div>
                              </div>
                              <div className="order-items">
                                {order.items.map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                                    {item.product && item.product.images && item.product.images[0] && (
                                      <img src={item.product.images[0]} alt={item.product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                    )}
                                    <div>
                                      <div style={{ fontWeight: '500' }}>{item.product ? item.product.name : 'Unknown Product'}</div>
                                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Qty: {item.quantity} | Size: {item.size}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Status: <strong style={{ color: '#1e293b' }}>{order.orderStatus}</strong></span>
                                <span style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>View Details &#8594;</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
              
              {activeTab === 'saved' && (
                <section className="orders-section">
                  <h2 className="section-title">My Saved Looks</h2>
                  {savedLooks.length === 0 ? (
                    <div className="empty-orders">
                      <p>You haven't saved any looks yet.</p>
                      <button className="btn-shop-now" onClick={() => navigate('/home')}>Discover Styles</button>
                    </div>
                  ) : (
                    <div className="saved-looks-grid" style={{ marginTop: '1rem' }}>
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
                              className="btn btn-primary" 
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
                      <button className="btn-shop-now" onClick={() => navigate('/home')}>Shop Now</button>
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
                        <button className="btn-primary" onClick={() => navigate('/checkout')} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                          Proceed to Checkout
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
              
              {/* Placeholders for other tabs */}
              {activeTab === 'points' && (
                <section className="orders-section">
                  <h2 className="section-title">My Points</h2>
                  <div className="empty-orders">
                    <p>This section is currently under construction.</p>
                  </div>
                </section>
              )}

              {activeTab === 'address' && (
                <section className="orders-section">
                  <h2 className="section-title">My Address</h2>
                  
                  {!showAddressForm ? (
                    <div>
                      {(!user?.addresses || user.addresses.length === 0) ? (
                        <div className="empty-orders">
                          <p>You haven't saved any addresses yet.</p>
                        </div>
                      ) : (
                        <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                          {user.addresses.map((addr, index) => (
                            <div key={index} className="address-card" style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative', background: '#f8fafc' }}>
                              <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#e11d48', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>{addr.addressType}</span>
                              <h4 style={{ margin: '0 0 0.5rem 0' }}>{addr.houseNo}, {addr.street}</h4>
                              <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}>{addr.area}</p>
                              <p style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                              {addr.landmark && <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>Landmark: {addr.landmark}</p>}
                              
                              <button onClick={() => handleDeleteAddress(index)} style={{ marginTop: '1rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Delete Address
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div style={{ marginTop: '2rem' }}>
                        {(!user?.addresses || user.addresses.length < 3) ? (
                          <button 
                            onClick={() => setShowAddressForm(true)}
                            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f43f5e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(244, 63, 94, 0.2)', transition: 'background-color 0.2s ease' }}
                          >
                            Add New Address
                          </button>
                        ) : (
                          <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>You have reached the maximum limit of 3 addresses. Delete one to add a new address.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAddress} className="address-form" style={{ marginTop: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>House / Flat No *</label>
                          <input type="text" required name="houseNo" value={addressForm.houseNo} onChange={handleAddressChange} className="checkout-input" />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Street *</label>
                          <input type="text" required name="street" value={addressForm.street} onChange={handleAddressChange} className="checkout-input" />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Area *</label>
                          <input type="text" required name="area" value={addressForm.area} onChange={handleAddressChange} className="checkout-input" />
                        </div>
                        <div className="form-group">
                          <label>City *</label>
                          <input type="text" required name="city" value={addressForm.city} onChange={handleAddressChange} className="checkout-input" />
                        </div>
                        <div className="form-group">
                          <label>State *</label>
                          <input type="text" required name="state" value={addressForm.state} onChange={handleAddressChange} className="checkout-input" />
                        </div>
                        <div className="form-group">
                          <label>Pincode *</label>
                          <input type="text" required name="pincode" value={addressForm.pincode} onChange={handleAddressChange} className="checkout-input" />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Landmark (Optional)</label>
                          <input type="text" name="landmark" value={addressForm.landmark} onChange={handleAddressChange} className="checkout-input" />
                        </div>
                      </div>

                      <div className="address-type-selector" style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Address Type:</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          {['Home', 'Work', 'Other'].map(type => (
                            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input type="radio" name="addressType" value={type} checked={addressForm.addressType === type} onChange={handleAddressChange} />
                              <span>{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f43f5e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(244, 63, 94, 0.2)', transition: 'background-color 0.2s ease' }}>Save Address</button>
                        <button type="button" onClick={() => setShowAddressForm(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                      </div>
                    </form>
                  )}
                </section>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
      
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={reviewContext.productId}
        orderId={reviewContext.orderId}
        productName={reviewContext.productName}
        onSuccess={() => window.dispatchEvent(new Event('reviewSubmitted'))}
      />
    </div>
  );
};

export default UserDashboard;

// Helper component for the Write Review button
const OrderReviewButton = ({ productId, orderId, productName, onOpenModal }) => {
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkReviewStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/reviews/product/${productId}/can-review?orderId=${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.canReview) {
             setCanReview(true);
          } else if (data.alreadyReviewed) {
             setAlreadyReviewed(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkReviewStatus();
  }, [productId, orderId]);

  if (loading) return null;
  
  if (alreadyReviewed) {
    return <button disabled style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }}>Review Submitted</button>;
  }

  if (canReview) {
    return <button onClick={() => onOpenModal(productId, orderId, productName)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#3b82f6', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}>Write Review</button>;
  }

  return null;
};
