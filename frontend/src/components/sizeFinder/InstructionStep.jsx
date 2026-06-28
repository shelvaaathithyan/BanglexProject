import React from 'react';
import { Check, ShieldCheck, Clock, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const InstructionStep = () => {
  return (
    <motion.div 
      className="sf-step-container sf-instruction-v2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sf-instruction-grid">
        
        {/* Left Column: Checklist */}
        <div className="sf-instruction-left">
          <h3 className="sf-instruction-heading">Preparation Checklist</h3>
          <ul className="sf-elegant-checklist-v2">
            <li>
              <div className="sf-check-circle"><Check size={16} /></div>
              <span>Ensure good, even lighting</span>
            </li>
            <li>
              <div className="sf-check-circle"><Check size={16} /></div>
              <span>Remove any existing bangles</span>
            </li>
            <li>
              <div className="sf-check-circle"><Check size={16} /></div>
              <span>Keep your hand very steady</span>
            </li>
            <li>
              <div className="sf-check-circle"><Check size={16} /></div>
              <span>Fold thumb flat across your palm</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Info & Privacy */}
        <div className="sf-instruction-right">
          <div className="sf-info-card">
            <Clock size={20} className="sf-info-icon" />
            <div className="sf-info-text">
              <h4>Estimated Time</h4>
              <p>Under 30 seconds</p>
            </div>
          </div>
          
          <div className="sf-info-card">
            <Smartphone size={20} className="sf-info-icon" />
            <div className="sf-info-text">
              <h4>Supported Devices</h4>
              <p>Works on all modern smartphones, tablets, and laptops.</p>
            </div>
          </div>

          <div className="sf-info-card sf-privacy-card-v2">
            <ShieldCheck size={20} className="sf-privacy-icon-v2" />
            <div className="sf-info-text">
              <h4>Privacy Guarantee</h4>
              <p>All AI processing occurs securely on your device. No images are uploaded to any server. The camera shuts off automatically.</p>
            </div>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
};

export default InstructionStep;
