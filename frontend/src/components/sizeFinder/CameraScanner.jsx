import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCAN_PHASES } from '../../hooks/useHandScanner';
import ScanProgress from './ScanProgress';

const CameraScanner = ({ scannerHook }) => {
  const { 
    videoRef,
    canvasRef,
    phase, 
    qualityScore, 
    countdown, 
    errorMsg, 
    startScanner 
  } = scannerHook;

  useEffect(() => {
    // Start scanner on mount
    startScanner();
  }, [startScanner]);

  const getOverlayText = () => {
    if (errorMsg) return errorMsg;
    if (countdown !== null) return countdown.toString();
    switch (phase) {
      case SCAN_PHASES.INITIALIZING: return "Starting Camera...";
      case SCAN_PHASES.SEARCHING: return "Place Your Hand Here";
      case SCAN_PHASES.CHECKING_POSITION: return "Checking Position...";
      case SCAN_PHASES.STABILIZING: return "Hold Steady";
      case SCAN_PHASES.MEASURING: return "Measuring...";
      case SCAN_PHASES.CALCULATING: return "Calculating Size...";
      default: return "";
    }
  };

  return (
    <div className="sf-scanner-container">
      <div className="sf-video-wrapper">
        <video 
          ref={videoRef} 
          className="sf-video-element" 
          playsInline 
          autoPlay 
          muted 
        />
        <canvas 
          ref={canvasRef} 
          className="sf-canvas-overlay"
        />
        
        {/* Animated Scanning Overlay */}
        <AnimatePresence>
          {(phase === SCAN_PHASES.SEARCHING || phase === SCAN_PHASES.CHECKING_POSITION) && (
            <motion.div 
              className="sf-hand-guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="sf-guide-border" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Overlay */}
        <div className="sf-status-overlay">
          <motion.div 
            key={getOverlayText()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`sf-status-text ${countdown !== null ? 'sf-countdown' : ''}`}
          >
            {getOverlayText()}
          </motion.div>
        </div>
      </div>

      <ScanProgress phase={phase} qualityScore={qualityScore} />
    </div>
  );
};

export default CameraScanner;
