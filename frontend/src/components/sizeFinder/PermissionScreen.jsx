import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import PrivacyCard from './PrivacyCard';

const PermissionScreen = ({ onContinue }) => {
  return (
    <motion.div 
      className="sf-permission-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="sf-permission-content">
        <h2 className="sf-permission-title">Before we begin...</h2>
        
        <div className="sf-checklist">
          <div className="sf-check-item">
            <CheckCircle2 size={18} className="sf-check-icon" />
            <span>Good lighting</span>
          </div>
          <div className="sf-check-item">
            <CheckCircle2 size={18} className="sf-check-icon" />
            <span>Entire hand visible</span>
          </div>
          <div className="sf-check-item">
            <CheckCircle2 size={18} className="sf-check-icon" />
            <span>Keep palm facing camera</span>
          </div>
          <div className="sf-check-item">
            <CheckCircle2 size={18} className="sf-check-icon" />
            <span>Spread fingers naturally</span>
          </div>
          <div className="sf-check-item">
            <CheckCircle2 size={18} className="sf-check-icon" />
            <span>Remove large accessories</span>
          </div>
          <div className="sf-check-item">
            <CheckCircle2 size={18} className="sf-check-icon" />
            <span>Stay still for a few seconds</span>
          </div>
        </div>

        <PrivacyCard />

        <button className="sf-btn-primary sf-continue-btn" onClick={onContinue}>
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default PermissionScreen;
