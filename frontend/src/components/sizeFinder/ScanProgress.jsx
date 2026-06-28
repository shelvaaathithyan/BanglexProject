import React from 'react';
import { motion } from 'framer-motion';
import { SCAN_PHASES } from '../../hooks/useHandScanner';

const ScanProgress = ({ phase, qualityScore }) => {
  const getPhaseIndex = () => {
    switch (phase) {
      case SCAN_PHASES.INITIALIZING: return 0;
      case SCAN_PHASES.SEARCHING: return 1;
      case SCAN_PHASES.CHECKING_POSITION: return 2;
      case SCAN_PHASES.STABILIZING: return 3;
      case SCAN_PHASES.MEASURING: return 4;
      case SCAN_PHASES.CALCULATING: return 5;
      case SCAN_PHASES.COMPLETE: return 6;
      default: return 0;
    }
  };

  const steps = [
    "Starting", 
    "Searching", 
    "Position", 
    "Stability", 
    "Measuring", 
    "Calculating"
  ];
  
  const currentIndex = getPhaseIndex();

  return (
    <div className="sf-progress-container">
      {/* Visual Step Indicator */}
      <div className="sf-steps-track">
        {steps.map((step, idx) => (
          <div 
            key={step} 
            className={`sf-step-dot ${idx <= currentIndex ? 'active' : ''} ${idx === currentIndex ? 'current' : ''}`}
            title={step}
          />
        ))}
      </div>

      {/* Live Confidence Indicators */}
      <div className="sf-confidence-meters">
        <div className="sf-meter">
          <div className="sf-meter-label">
            <span>Hand Detection</span>
            <span>{phase === SCAN_PHASES.INITIALIZING || phase === SCAN_PHASES.SEARCHING ? '0%' : '100%'}</span>
          </div>
          <div className="sf-meter-bar-bg">
            <motion.div 
              className="sf-meter-bar-fill" 
              initial={{ width: 0 }}
              animate={{ width: phase === SCAN_PHASES.INITIALIZING || phase === SCAN_PHASES.SEARCHING ? '0%' : '100%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="sf-meter">
          <div className="sf-meter-label">
            <span>Measurement Quality</span>
            <span>{qualityScore}%</span>
          </div>
          <div className="sf-meter-bar-bg">
            <motion.div 
              className="sf-meter-bar-fill" 
              initial={{ width: 0 }}
              animate={{ width: `${qualityScore}%` }}
              style={{ backgroundColor: qualityScore > 85 ? '#10b981' : '#f59e0b' }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanProgress;
