import React from 'react';
import { Shield, Cpu, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const IntroStep = () => {
  return (
    <motion.div 
      className="sf-step-container sf-intro-v2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sf-intro-bg-pattern" />
      
      <div className="sf-intro-content-wrapper">
        <h1 className="sf-step-title sf-text-luxury">AI Size Finder</h1>
        <p className="sf-step-subtitle sf-mx-auto">
          Experience the most precise bangle sizing technology. <br/>
          Find your perfect fit in under 30 seconds.
        </p>

        <div className="sf-badges-container-v2">
          <div className="sf-badge-v2">
            <Lock size={16} className="sf-badge-icon" />
            <span>100% Private</span>
          </div>
          <div className="sf-badge-v2">
            <Cpu size={16} className="sf-badge-icon" />
            <span>AI Powered</span>
          </div>
          <div className="sf-badge-v2">
            <Shield size={16} className="sf-badge-icon" />
            <span>No Data Uploaded</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IntroStep;
