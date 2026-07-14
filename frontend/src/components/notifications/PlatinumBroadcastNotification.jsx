import React, { useEffect, useState } from 'react';
import { Gift, X, Diamond, Star, Megaphone, Flame, Heart, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Platinum Broadcast Notification
const PlatinumBroadcastNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss based on displayDuration
  useEffect(() => {
    if (notification.displayDuration) {
      // Parse displayDuration which could be like "10 seconds" or "1 minute"
      let durationMs = 10000; // default 10s
      if (notification.displayDuration.includes('second')) {
        durationMs = parseInt(notification.displayDuration) * 1000;
      } else if (notification.displayDuration.includes('minute')) {
        durationMs = parseInt(notification.displayDuration) * 60 * 1000;
      }

      const timer = setTimeout(() => {
        handleClose();
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 500); // Wait for exit animation
  };

  const getIcon = () => {
    switch (notification.icon) {
      case 'Diamond': return <Diamond size={24} className="platinum-icon" />;
      case 'Gift': return <Gift size={24} className="platinum-icon" />;
      case 'Star': return <Star size={24} className="platinum-icon" />;
      case 'Announcement': return <Megaphone size={24} className="platinum-icon" />;
      case 'Fire': return <Flame size={24} className="platinum-icon" />;
      case 'Heart': return <Heart size={24} className="platinum-icon" />;
      default: return <Diamond size={24} className="platinum-icon" />;
    }
  };

  const getGradient = () => {
    switch (notification.type) {
      case 'Success': return 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(21,128,61,0.2))';
      case 'Warning': return 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(180,83,9,0.2))';
      case 'Offer': return 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(190,24,93,0.2))';
      default: return 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(226, 232, 240, 0.2) 100%)'; // Platinum
    }
  };

  const borderColor = notification.type === 'Broadcast Platinum' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.3)';
  const shadowColor = notification.type === 'Broadcast Platinum' ? 'rgba(203, 213, 225, 0.3)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="platinum-broadcast-notification"
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            width: '320px',
            background: getGradient(),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '16px',
            boxShadow: `0 10px 25px -5px ${shadowColor}, 0 8px 10px -6px ${shadowColor}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflow: 'hidden',
            color: '#1e293b'
          }}
        >
          {/* Reflective shine effect for premium feel */}
          <div className="platinum-shine"></div>

          <button 
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              zIndex: 10
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative', zIndex: 5 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              border: '1px solid #cbd5e1',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 5px rgba(0,0,0,0.05)',
              flexShrink: 0
            }}>
              {getIcon()}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {notification.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
                {notification.message}
              </p>
            </div>
          </div>

          {notification.buttonText && notification.buttonUrl && (
            <div style={{ marginTop: '4px', position: 'relative', zIndex: 5 }}>
              <a 
                href={notification.buttonUrl}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(to right, #0f172a, #334155)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {notification.buttonText}
              </a>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlatinumBroadcastNotification;
