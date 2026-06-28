import React from 'react';
import { Zap, Target } from 'lucide-react';

const ModeStep = ({ onSelectMode }) => {
  return (
    <div className="sf-step-container">
      <h2 className="sf-step-title">Choose Scan Mode</h2>
      
      <div className="sf-mode-cards-vertical">
        <div className="sf-mode-card-v2" onClick={() => onSelectMode('QUICK')}>
          <div className="sf-mode-header">
            <h4>Quick Scan</h4>
            <Zap size={20} className="sf-mode-icon" />
          </div>
          <ul className="sf-mode-features">
            <li><span>⚡ 15 seconds</span></li>
            <li><span>★★★★☆ Accuracy</span></li>
            <li><span>No Card Required</span></li>
          </ul>
          <div className="sf-mode-footer">Recommended for most users</div>
        </div>
        
        <div className="sf-mode-card-v2 highlight" onClick={() => onSelectMode('HIGH_ACCURACY')}>
          <div className="sf-recommended-badge">Recommended</div>
          <div className="sf-mode-header">
            <h4>Precision Scan</h4>
            <Target size={20} className="sf-mode-icon" />
          </div>
          <ul className="sf-mode-features">
            <li><span>⭐ Highest Accuracy</span></li>
            <li><span>★★★★★ Accuracy</span></li>
            <li><span>Debit/Credit Card Required</span></li>
          </ul>
          <div className="sf-mode-footer">Professional Measurement</div>
        </div>
      </div>
    </div>
  );
};

export default ModeStep;
