import React from 'react';
import { Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const ModeStep = ({ onSelectMode, currentMode }) => {
  return (
    <motion.div 
      className="sf-step-container sf-mode-v2"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sf-mode-cards-horizontal">
        <div 
          className={`sf-mode-card-v3 ${currentMode === 'QUICK' ? 'selected' : ''}`} 
          onClick={() => onSelectMode('QUICK')}
        >
          <div className="sf-mode-header-v3">
            <div className="sf-mode-title-wrapper">
              <Zap size={24} className="sf-mode-icon-v3" />
              <h4>Quick Scan</h4>
            </div>
          </div>
          <div className="sf-mode-body-v3">
            <div className="sf-mode-metric">
              <span className="sf-metric-label">Speed</span>
              <span className="sf-metric-value">⚡ 15 Seconds</span>
            </div>
            <div className="sf-mode-metric">
              <span className="sf-metric-label">Accuracy</span>
              <span className="sf-metric-value">★★★★☆ Good</span>
            </div>
            <div className="sf-mode-metric">
              <span className="sf-metric-label">Requirement</span>
              <span className="sf-metric-value">No Card Needed</span>
            </div>
          </div>
          <div className="sf-mode-footer-v3">Recommended for most users</div>
        </div>
        
        <div 
          className={`sf-mode-card-v3 highlight-v3 ${currentMode === 'HIGH_ACCURACY' ? 'selected' : ''}`} 
          onClick={() => onSelectMode('HIGH_ACCURACY')}
        >
          <div className="sf-recommended-badge-v3">Highest Precision</div>
          <div className="sf-mode-header-v3">
            <div className="sf-mode-title-wrapper">
              <Target size={24} className="sf-mode-icon-v3" />
              <h4>Precision Scan</h4>
            </div>
          </div>
          <div className="sf-mode-body-v3">
            <div className="sf-mode-metric">
              <span className="sf-metric-label">Speed</span>
              <span className="sf-metric-value">⚡ 30 Seconds</span>
            </div>
            <div className="sf-mode-metric">
              <span className="sf-metric-label">Accuracy</span>
              <span className="sf-metric-value">★★★★★ Perfect</span>
            </div>
            <div className="sf-mode-metric">
              <span className="sf-metric-label">Requirement</span>
              <span className="sf-metric-value">Debit/Credit Card</span>
            </div>
          </div>
          <div className="sf-mode-footer-v3">For professional measurement</div>
        </div>
      </div>
    </motion.div>
  );
};

export default ModeStep;
