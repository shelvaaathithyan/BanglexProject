import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Truck, Gift, Info } from 'lucide-react';
import { getFestivalPrice, isFestivalActive } from '../utils/festivalPrice';
import API_BASE from '../config/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [activeFestival, setActiveFestival] = useState(null);
  const [user, setUser] = useState(null);

  // Form states
  const [contact, setContact] = useState({ fullName: '', mobile: '', email: '' });
  const [address, setAddress] = useState({
    houseNo: '', street: '', area: '', city: '', state: '', pincode: '', landmark: ''
  });
  const [addressType, setAddressType] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  
  const [deliveryOption, setDeliveryOption] = useState('Standard');
  const [giftOptions, setGiftOptions] = useState({ wrap: false, message: false, messageText: '' });
  const [orderNotes, setOrderNotes] = useState('');
  
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [returnAgreed, setReturnAgreed] = useState(false);

  useEffect(() => {
    // Load cart
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    if (items.length === 0) {
      navigate('/home'); // Redirect if empty
    }
    setCartItems(items);

    // Fetch active festival for accurate display (in case prices were old in cart)
    const fetchActiveFestival = async () => {
      try {
        const res = await fetch(`${API_BASE}/festivals/active`);
        if (res.ok) {
          const data = await res.json();
          if (data && isFestivalActive(data)) {
            setActiveFestival(data);
          }
        }
      } catch (err) {
        console.error('Error fetching active festival:', err);
      }
    };

    // Fetch user profile
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setContact(prev => ({
            ...prev,
            fullName: prev.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            mobile: prev.mobile || userData.mobileNumber || '',
            email: prev.email || userData.email || ''
          }));
          
          if (userData.addresses && userData.addresses.length > 0) {
            const defaultAddr = userData.addresses[0];
            setAddress(prev => prev.city ? prev : { ...defaultAddr });
            setAddressType(defaultAddr.addressType || 'Home');
            setSaveAddress(false); // Already saved
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchActiveFestival();
    fetchUserProfile();
    window.scrollTo(0, 0);
  }, [navigate]);

  const handleSelectSavedAddress = (selectedAddr) => {
    setAddress({ ...selectedAddr });
    setAddressType(selectedAddr.addressType || 'Home');
    setSaveAddress(false);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const isFormValid = 
    contact.fullName.trim() !== '' &&
    contact.mobile.trim() !== '' &&
    contact.email.trim() !== '' &&
    address.houseNo.trim() !== '' &&
    address.street.trim() !== '' &&
    address.area.trim() !== '' &&
    address.city.trim() !== '' &&
    address.state.trim() !== '' &&
    address.pincode.trim() !== '' &&
    termsAgreed &&
    returnAgreed;

  const discount = activeFestival && activeFestival.discountType === 'Percentage (%)' 
    ? (subtotal * activeFestival.discountValue / 100)
    : (activeFestival && activeFestival.discountType === 'Flat Amount (₹)' ? activeFestival.discountValue : 0);
  
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  // Standard delivery temporarily set to 0 for testing
  const shipping = subtotalAfterDiscount >= 999 ? 0 : (deliveryOption === 'Express' ? 150 : 0);
  const gst = subtotalAfterDiscount * 0.05; // Assuming 5% GST
  const grandTotal = subtotalAfterDiscount + shipping + gst;

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!termsAgreed || !returnAgreed) {
      alert("Please agree to the Terms & Conditions and Return Policy.");
      return;
    }

    if (saveAddress && addressType && user) {
      // Check if this address type (e.g., 'Home') already exists in the user's profile
      const typeExists = (user.addresses || []).some(a => a.addressType === addressType);
      
      if (typeExists) {
        alert(`You already have a "${addressType}" address saved in your profile. You cannot override it from here. Please uncheck "Save this address" or select a different Address Type.`);
        return; // Stop the checkout process so they can fix it
      }

      const isDuplicate = (user.addresses || []).some(a => a.houseNo === address.houseNo && a.pincode === address.pincode);
      if (!isDuplicate) {
        if ((user.addresses || []).length >= 3) {
          alert("You already have 3 addresses saved. Please manage your addresses in your dashboard if you wish to save a new one. Your order will proceed with the entered address without saving it.");
        } else {
          try {
            const token = localStorage.getItem('token');
            const newAddresses = [...(user.addresses || []), { ...address, addressType }];
            await fetch(`${API_BASE}/auth/profile`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ addresses: newAddresses })
            });
          } catch (err) {
            console.error('Failed to save address:', err);
          }
        }
      }
    }

    // TODO: Proceed to Payment Module
    alert("Proceeding to payment module... (Coming soon)");
  };

  return (
    <div className="checkout-page">
      <Navbar />
      
      <main className="checkout-container">
        <div className="checkout-header">
          <Link to="/home" className="back-link">
            <ArrowLeft size={16} /> Back to Shopping
          </Link>
          <h1 className="checkout-title">Secure Checkout</h1>
        </div>

        <form onSubmit={handleProceedToPayment} className="checkout-layout">
          {/* Left Column - Details */}
          <div className="checkout-details-column">
            
            {/* 1. Contact Information */}
            <section className="checkout-section glass-card-checkout">
              <h2 className="section-title"><UserIcon /> Contact Information</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Full Name *</label>
                  <input type="text" required value={contact.fullName} onChange={e => setContact({...contact, fullName: e.target.value})} placeholder="Enter your full name" className="checkout-input" />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input type="tel" required value={contact.mobile} onChange={e => setContact({...contact, mobile: e.target.value})} placeholder="+91" className="checkout-input" />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" required value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} placeholder="you@example.com" className="checkout-input" />
                </div>
              </div>
            </section>

            {/* 2. Delivery Address */}
            <section className="checkout-section glass-card-checkout">
              <h2 className="section-title"><MapIcon /> Delivery Address</h2>
              
              {user && user.addresses && user.addresses.length > 0 && (
                <div className="saved-addresses-selector" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#64748b' }}>Select a Saved Address</h3>
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {user.addresses.map((addr, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleSelectSavedAddress(addr)}
                        style={{ minWidth: '200px', cursor: 'pointer', padding: '0.75rem', border: (address.houseNo === addr.houseNo && address.pincode === addr.pincode) ? '2px solid #f43f5e' : '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                      >
                        <span style={{ fontSize: '0.75rem', background: '#e11d48', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>{addr.addressType}</span>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>{addr.houseNo}, {addr.street}</p>
                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#64748b' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>House / Flat No *</label>
                  <input type="text" required value={address.houseNo} onChange={e => setAddress({...address, houseNo: e.target.value})} className="checkout-input" />
                </div>
                <div className="form-group full-width">
                  <label>Street *</label>
                  <input type="text" required value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="checkout-input" />
                </div>
                <div className="form-group full-width">
                  <label>Area *</label>
                  <input type="text" required value={address.area} onChange={e => setAddress({...address, area: e.target.value})} className="checkout-input" />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="checkout-input" />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="checkout-input" />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input type="text" required value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="checkout-input" />
                </div>
                <div className="form-group full-width">
                  <label>Landmark (Optional)</label>
                  <input type="text" value={address.landmark} onChange={e => setAddress({...address, landmark: e.target.value})} className="checkout-input" />
                </div>
              </div>

              <div className="address-type-selector">
                <label className="type-label">Address Type (Optional):</label>
                <div className="radio-group-row">
                  {['Home', 'Work', 'Other'].map(type => {
                    const isTaken = (user?.addresses || []).some(a => a.addressType === type);
                    return (
                      <label key={type} className="radio-label custom-radio" style={{ opacity: isTaken ? 0.5 : 1, cursor: isTaken ? 'not-allowed' : 'pointer' }} title={isTaken ? `You already have a ${type} address saved` : ''}>
                        <input 
                          type="radio" 
                          name="addressType" 
                          checked={addressType === type} 
                          disabled={isTaken}
                          onChange={() => {
                            if (isTaken) return;
                            // Toggle logic: if clicking already selected, deselect it
                            if (addressType === type) {
                              setAddressType('');
                              setSaveAddress(false);
                            } else {
                              setAddressType(type);
                              setSaveAddress(true);
                            }
                          }} 
                          onClick={() => {
                            if (isTaken) return;
                            if (addressType === type) {
                              setAddressType('');
                              setSaveAddress(false);
                            }
                          }}
                        />
                        <span className="radio-text">{type} {isTaken && '(Saved)'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {addressType && (
                <label className="checkbox-label save-address mt-4">
                  <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                  <span className="checkmark"></span>
                  Save this address (Default Address)
                </label>
              )}
            </section>

            {/* 3. Delivery Options */}
            <section className="checkout-section glass-card-checkout">
              <h2 className="section-title"><Truck size={20} /> Delivery Options</h2>
              <div className="delivery-options-grid">
                <label className={`delivery-card ${deliveryOption === 'Standard' ? 'active' : ''}`}>
                  <input type="radio" name="delivery" checked={deliveryOption === 'Standard'} onChange={() => setDeliveryOption('Standard')} />
                  <div className="delivery-card-content">
                    <span className="delivery-title">Standard Delivery</span>
                    <span className="delivery-time">3-5 Business Days</span>
                    <span className="delivery-price">FREE</span>
                  </div>
                </label>
                <label className={`delivery-card ${deliveryOption === 'Express' ? 'active' : ''}`}>
                  <input type="radio" name="delivery" checked={deliveryOption === 'Express'} onChange={() => setDeliveryOption('Express')} />
                  <div className="delivery-card-content">
                    <span className="delivery-title">Express Delivery</span>
                    <span className="delivery-time">1-2 Business Days</span>
                    <span className="delivery-price">{subtotalAfterDiscount >= 999 ? 'FREE' : 'Rs. 150.00'}</span>
                  </div>
                </label>
              </div>
            </section>

            {/* 5. Gift Options (Optional) */}
            <section className="checkout-section glass-card-checkout">
              <h2 className="section-title"><Gift size={20} /> Gift Options (Optional)</h2>
              <div className="gift-options">
                <label className="checkbox-label">
                  <input type="checkbox" checked={giftOptions.wrap} onChange={e => setGiftOptions({...giftOptions, wrap: e.target.checked})} />
                  <span className="checkmark"></span>
                  Gift Wrap (Rs. 50.00)
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={giftOptions.message} onChange={e => setGiftOptions({...giftOptions, message: e.target.checked})} />
                  <span className="checkmark"></span>
                  Include Gift Message
                </label>
                {giftOptions.message && (
                  <textarea 
                    className="checkout-textarea mt-2" 
                    placeholder="Enter your gift message here..."
                    value={giftOptions.messageText}
                    onChange={e => setGiftOptions({...giftOptions, messageText: e.target.value})}
                  />
                )}
              </div>
            </section>

            {/* 6. Order Notes */}
            <section className="checkout-section glass-card-checkout">
              <h2 className="section-title"><Info size={20} /> Order Notes (Optional)</h2>
              <textarea 
                className="checkout-textarea" 
                placeholder="Any special requests? (e.g. Leave package at the door)"
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
              />
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-summary-column">
            <div className="summary-card glass-card-checkout sticky-summary">
              <h2 className="section-title">Order Summary</h2>
              
              <div className="summary-products">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="summary-item">
                    <div className="summary-item-img">
                      <img src={item.image} alt={item.name} />
                      <span className="item-qty-badge">{item.quantity}</span>
                    </div>
                    <div className="summary-item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-variant">{item.size} | {item.color}</span>
                    </div>
                    <span className="item-price">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="total-row discount">
                    <span>Discount ({activeFestival?.name})</span>
                    <span>- Rs. {discount.toFixed(2)}</span>
                  </div>
                )}
                {giftOptions.wrap && (
                  <div className="total-row">
                    <span>Gift Wrap</span>
                    <span>Rs. 50.00</span>
                  </div>
                )}
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`}</span>
                </div>
                <div className="total-row">
                  <span>GST (5%)</span>
                  <span>Rs. {gst.toFixed(2)}</span>
                </div>
                
                <div className="total-row grand-total">
                  <span>Grand Total</span>
                  <span>Rs. {(grandTotal + (giftOptions.wrap ? 50 : 0)).toFixed(2)}</span>
                </div>
              </div>

              {/* 7. Terms */}
              <div className="checkout-terms mt-4">
                <label className="checkbox-label">
                  <input type="checkbox" required checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} />
                  <span className="checkmark"></span>
                  I agree to the Terms & Conditions
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" required checked={returnAgreed} onChange={e => setReturnAgreed(e.target.checked)} />
                  <span className="checkmark"></span>
                  I understand the Return Policy
                </label>
              </div>

              {/* 8. Continue To Payment Button */}
              <button 
                type="submit" 
                className={`btn-continue-payment ${!isFormValid ? 'disabled' : ''}`}
                disabled={!isFormValid}
              >
                Continue To Payment
              </button>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

// Helper SVG Icons
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const MapIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

export default CheckoutPage;
