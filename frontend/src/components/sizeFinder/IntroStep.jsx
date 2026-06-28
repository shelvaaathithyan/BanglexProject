import React from 'react';
import { Shield, Cpu, Lock } from 'lucide-react';

const IntroStep = ({ onNext }) => {
  return (
    <div className="sf-step-container">
      <h1 className="sf-step-title">AI Size Finder</h1>
      <p className="sf-step-subtitle">
        Find your perfect bangle size in less than 30 seconds.<br/>
        Everything runs locally on your device.
      </p>

      <div className="sf-badges-container">
        <div className="sf-badge">
          <Lock size={16} /> Private
        </div>
        <div className="sf-badge">
          <Cpu size={16} /> AI Powered
        </div>
        <div className="sf-badge">
          <Shield size={16} /> No Data Stored
        </div>
      </div>

      <button className="sf-btn-primary sf-mt-xl" onClick={onNext}>
        Start Scan
      </button>
    </div>
  );
};

export default IntroStep;
