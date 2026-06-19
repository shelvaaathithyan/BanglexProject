import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  const [activePolicy, setActivePolicy] = useState(null);

  const policies = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="policy-text">
          <p>At RaHa Creations, we prioritize your privacy and are committed to protecting your personal data. This policy outlines how we handle your information:</p>
          <h4>1. Information Collection</h4>
          <p>We collect information you provide directly to us when creating an account, updating your profile, or making a purchase (such as name, email, shipping address, and order history).</p>
          <h4>2. How We Use Your Information</h4>
          <p>We use your information to process transactions, deliver products, communicate updates, and personalize your experience. We do not sell or share your personal data with third parties except for shipping providers.</p>
          <h4>3. Data Security</h4>
          <p>We implement standard secure protocols to encrypt transaction data and protect your private login information.</p>
        </div>
      )
    },
    refund: {
      title: "Refund Policy",
      content: (
        <div className="policy-text">
          <p>We take pride in the quality of our handcrafted jewellery collections. If you are not completely satisfied with your purchase, please review our refund terms:</p>
          <h4>1. Eligibility for Returns</h4>
          <p>Items can be returned within 14 days of receipt. To be eligible, jewellery must be unworn, in its original packaging, and in the same condition that you received it.</p>
          <h4>2. Process</h4>
          <p>Please contact our support team with your order number to request a return authorization. Once verified, a replacement or store credit/refund will be issued.</p>
          <h4>3. Non-Returnable Items</h4>
          <p>Custom-sized bangles or custom jewelry sets cannot be returned unless they arrive damaged or defective.</p>
        </div>
      )
    },
    shipping: {
      title: "Shipping Policy",
      content: (
        <div className="policy-text">
          <p>Thank you for shopping at RaHa Creations. Here are the details of our shipping terms and delivery timelines:</p>
          <h4>1. Shipping Rates & Delivery</h4>
          <p>We offer <strong>Free Shipping</strong> on all orders above Rs. 999.00! For orders below Rs. 999.00, a flat shipping fee is calculated at checkout.</p>
          <h4>2. Processing Time</h4>
          <p>All items are handcrafted. Orders are typically processed and shipped within 2-3 business days. Delivery times vary by region (usually 3-7 business days).</p>
          <h4>3. Order Tracking</h4>
          <p>Once your order has been dispatched, you will receive an email containing tracking details to follow your shipment's journey.</p>
        </div>
      )
    },
    contact: {
      title: "Contact Information",
      content: (
        <div className="policy-text contact-info-modal">
          <p>Have questions or need assistance with your order? Reach out to us directly:</p>
          <div className="contact-item">
            <Mail size={18} />
            <div>
              <strong>Email Us</strong>
              <p><a href="mailto:support@rahacreations.com">support@rahacreations.com</a></p>
            </div>
          </div>
          <div className="contact-item">
            <Phone size={18} />
            <div>
              <strong>Call Us</strong>
              <p>+91 98765 43210 (Mon-Sat, 9 AM - 6 PM)</p>
            </div>
          </div>
          <div className="contact-item">
            <MapPin size={18} />
            <div>
              <strong>Our Workshop</strong>
              <p>12, Temple Road, Alwarpet, Chennai, Tamil Nadu - 600018</p>
            </div>
          </div>
          <div className="contact-item">
            <Clock size={18} />
            <div>
              <strong>Hours</strong>
              <p>Monday - Saturday: 9:00 AM - 6:00 PM (IST)</p>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <>
      <footer className="store-footer">
        <div className="footer-content">
          <span>&copy; {new Date().getFullYear()}, RaHa Creations</span>
          <span className="footer-separator">&middot;</span>
          <button className="footer-btn" onClick={() => setActivePolicy('privacy')}>Privacy policy</button>
          <span className="footer-separator">&middot;</span>
          <button className="footer-btn" onClick={() => setActivePolicy('refund')}>Refund policy</button>
          <span className="footer-separator">&middot;</span>
          <button className="footer-btn" onClick={() => setActivePolicy('shipping')}>Shipping policy</button>
          <span className="footer-separator">&middot;</span>
          <button className="footer-btn" onClick={() => setActivePolicy('contact')}>Contact information</button>
        </div>
      </footer>

      {activePolicy && (
        <div className="policy-modal-backdrop" onClick={() => setActivePolicy(null)}>
          <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="policy-modal-header">
              <h3>{policies[activePolicy].title}</h3>
              <button className="policy-modal-close" onClick={() => setActivePolicy(null)} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="policy-modal-body">
              {policies[activePolicy].content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
