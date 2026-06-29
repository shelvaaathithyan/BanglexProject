import React from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const CustomAlertComponent = ({ message, onClose }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '380px', width: '90%', position: 'relative' }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '50%' }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <X size={20} />
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '50%' }}>
              <AlertCircle size={32} />
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 600 }}>Attention Required</h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {message}
              </p>
            </div>
            
            <button
              onClick={onClose}
              style={{ marginTop: '0.75rem', background: '#0f172a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.target.style.background = '#1e293b'}
              onMouseOut={(e) => e.target.style.background = '#0f172a'}
            >
              Okay, Got it
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const setupCustomAlert = () => {
  window.alert = (message) => {
    const alertContainer = document.createElement('div');
    document.body.appendChild(alertContainer);
    
    const root = createRoot(alertContainer);
    
    const closeAlert = () => {
      root.unmount();
      if (document.body.contains(alertContainer)) {
        document.body.removeChild(alertContainer);
      }
    };
    
    root.render(<CustomAlertComponent message={message} onClose={closeAlert} />);
  };
};
