import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Download, ShoppingBag, Truck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState({ orderNumber: '', transactionId: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.state && location.state.orderNumber) {
      setOrderDetails({
        orderNumber: location.state.orderNumber,
        transactionId: location.state.transactionId || 'N/A'
      });
    } else {
      // If no state is passed, redirect to home
      navigate('/home');
    }
  }, [location, navigate]);

  // Calculate estimated delivery (5 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="payment-success-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', marginBottom: '1.5rem' }}>
            <CheckCircle size={48} />
          </div>
          
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Payment Successful!</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>Thank you for your purchase. Your order has been confirmed.</p>
          
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <span style={{ color: '#64748b' }}>Order Number</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{orderDetails.orderNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <span style={{ color: '#64748b' }}>Transaction ID</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{orderDetails.transactionId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck size={16} /> Estimated Delivery</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>{formattedDelivery}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => alert('Invoice download feature coming soon!')}
                style={{ flex: 1, padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Download size={18} /> Download Invoice
              </button>
              <Link 
                to="/user-dashboard" 
                style={{ flex: 1, padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s' }}
              >
                <Package size={18} /> View Order
              </Link>
            </div>
            <Link 
              to="/home" 
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', backgroundColor: '#e11d48', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s' }}
            >
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
