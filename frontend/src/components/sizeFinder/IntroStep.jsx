import React from 'react';
import { Shield, Cpu, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const IntroStep = ({ onNext }) => {
  return (
    <div className="sf-intro-v4">
      <div className="sf-intro-split-v4">
        <div className="sf-intro-left-v4">
          <h1 className="sf-heading-acme sf-hero-title-v4">AI Size Finder</h1>
          <p className="sf-hero-desc-v4">
            Experience the most precise bangle sizing technology.<br/>
            Find your perfect fit in under 30 seconds with intelligent hand-tracking.
          </p>
          <div className="sf-hero-benefits-v4">
            <div className="sf-hero-benefit-item"><div className="sf-benefit-dot"></div> Studio Quality Accuracy</div>
            <div className="sf-hero-benefit-item"><div className="sf-benefit-dot"></div> Real-Time Measurement</div>
          </div>
        </div>
        <div className="sf-intro-right-v4">
           <div className="sf-abstract-scan-art">
             <motion.div className="sf-art-ring r1" animate={{ scale: [1, 1.05, 1], rotate: [0, 90, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
             <motion.div className="sf-art-ring r2" animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
             <motion.div className="sf-art-center" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
           </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <button 
          className="sf-btn-primary" 
          onClick={onNext}
          style={{ minWidth: '200px' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default IntroStep;
