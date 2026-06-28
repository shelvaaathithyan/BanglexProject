import React from 'react';
import { motion } from 'framer-motion';
import { SCAN_PHASES } from '../../hooks/useHandScanner';
import { Star, StarHalf } from 'lucide-react';

const ScanProgress = ({ phase, confidence, progress }) => {
  const getPhaseIndex = () => {
    switch (phase) {
      case SCAN_PHASES.SELECT_MODE: return 0;
      case SCAN_PHASES.CALIBRATING: return 1;
      case SCAN_PHASES.INITIALIZING: return 2;
      case SCAN_PHASES.SEARCHING: return 3;
      case SCAN_PHASES.CHECKING_POSITION: return 4;
      case SCAN_PHASES.COLLECTING: return 5;
      case SCAN_PHASES.CALCULATING: return 6;
      case SCAN_PHASES.COMPLETE: return 7;
      default: return 0;
    }
  };

  const steps = [
    "Mode",
    "Calibrate",
    "Start", 
    "Search", 
    "Position", 
    "Measuring", 
    "Calc"
  ];
  
  const currentIndex = getPhaseIndex();

  const renderStars = (score) => {
    // Convert 0-100 to 1-5 stars
    const stars = Math.max(1, Math.min(5, Math.round(score / 20)));
    const elements = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= stars) {
        elements.push(<Star key={i} size={14} fill="#d4af37" color="#d4af37" />);
      } else {
        elements.push(<Star key={i} size={14} fill="none" color="#cbd5e1" />);
      }
    }
    return elements;
  };

  const getQualityText = (score) => {
    if (score >= 90) return "Very Reliable";
    if (score >= 75) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  if (phase === SCAN_PHASES.SELECT_MODE) {
    return null; // Don't show progress in mode selection
  }

  return (
    <div className="sf-progress-container">
      {/* Visual Step Indicator */}
      <div className="sf-steps-track" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
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
            <span>Buffer Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="sf-meter-bar-bg">
            <motion.div 
              className="sf-meter-bar-fill" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        <div className="sf-meter" style={{ marginTop: '0.75rem' }}>
          <div className="sf-meter-label">
            <span>Measurement Quality</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {getQualityText(confidence.overall)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '2px', marginTop: '0.25rem' }}>
            {renderStars(confidence.overall)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanProgress;
