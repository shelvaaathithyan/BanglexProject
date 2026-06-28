import React from 'react';
import { motion } from 'framer-motion';

const ModeStep = ({ onSelectMode, currentMode }) => {
  return (
    <div className="sf-mode-v4">
      <div className="sf-mode-cards-grid-v4">
        <div 
          className={`sf-mode-card-v4 ${currentMode === 'QUICK' ? 'selected' : ''}`} 
          onClick={() => onSelectMode('QUICK')}
        >
          <div className="sf-mode-card-header-v4">
            <h2 className="sf-heading-acme sf-mode-title-v4">Quick Scan</h2>
            <p className="sf-mode-desc-v4">Recommended for most users</p>
          </div>
          <ul className="sf-mode-features-v4">
            <li><span className="sf-feature-label">Speed</span> ⚡ 15 Seconds</li>
            <li><span className="sf-feature-label">Accuracy</span> <span style={{ color: '#D4AF37' }}>★★★★☆</span> Good</li>
            <li><span className="sf-feature-label">Requirement</span> No Card Needed</li>
          </ul>
        </div>
        
        <div 
          className={`sf-mode-card-v4 highlight-v4 ${currentMode === 'HIGH_ACCURACY' ? 'selected' : ''}`} 
          onClick={() => onSelectMode('HIGH_ACCURACY')}
        >
          {currentMode === 'HIGH_ACCURACY' && <div className="sf-mode-glow-v4"></div>}
          <div className="sf-recommended-badge-v4">Highest Precision</div>
          <div className="sf-mode-card-header-v4">
            <h2 className="sf-heading-acme sf-mode-title-v4">Precision Scan</h2>
            <p className="sf-mode-desc-v4">For professional measurement</p>
          </div>
          <ul className="sf-mode-features-v4">
            <li><span className="sf-feature-label">Speed</span> ⚡ 30 Seconds</li>
            <li><span className="sf-feature-label">Accuracy</span> <span style={{ color: '#D4AF37' }}>★★★★★</span> Perfect</li>
            <li><span className="sf-feature-label">Requirement</span> Debit/Credit Card</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModeStep;
