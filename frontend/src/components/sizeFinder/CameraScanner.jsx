import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCAN_PHASES } from '../../hooks/useHandScanner';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

const CameraScanner = ({ scannerHook }) => {
  const { 
    videoRef,
    canvasRef,
    phase, 
    confidence,
    errorMsg,
    scanMode,
    completeCalibration,
    startScanner
  } = scannerHook;

  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    // Only start scanner if we haven't already. (Usually called by Wizard before rendering this).
    if (phase === SCAN_PHASES.SELECT_MODE || phase === SCAN_PHASES.INITIALIZING) {
      startScanner();
    }
  }, [phase, startScanner]);

  useEffect(() => {
    if (phase === SCAN_PHASES.CALCULATING) {
      if (videoRef.current) videoRef.current.pause(); // Freeze feed
      
      // Simulate smooth processing steps
      const t1 = setTimeout(() => setProcessingStep(1), 800);
      const t2 = setTimeout(() => setProcessingStep(2), 1600);
      const t3 = setTimeout(() => setProcessingStep(3), 2400);
      
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [phase, videoRef]);

  const getStatusChip = (metricName, score, goodThreshold = 80, warnThreshold = 50) => {
    let status = 'error';
    if (score >= goodThreshold) status = 'good';
    else if (score >= warnThreshold) status = 'warning';
    
    // Custom messages
    let msg = '';
    if (metricName === 'Pose') {
      msg = status === 'good' ? 'Excellent' : 'Fold Thumb';
    } else if (metricName === 'Lighting') {
      msg = status === 'good' ? 'Good' : 'Adjust Light';
    } else if (metricName === 'Stability') {
      msg = status === 'good' ? 'Stable' : 'Hold Steady';
    } else if (metricName === 'Visibility') {
      msg = status === 'good' ? 'Perfect' : 'Show Hand';
    }

    return (
      <div className={`sf-status-chip sf-status-${status}`}>
        <span className="sf-chip-label">{metricName}</span>
        <span className="sf-chip-value">
          {status === 'good' && <CheckCircle2 size={12} />}
          {status === 'warning' && <AlertTriangle size={12} />}
          {status === 'error' && <XCircle size={12} />}
          {msg}
        </span>
      </div>
    );
  };

  const getTopStatus = () => {
    if (phase === SCAN_PHASES.CALCULATING) return "AI Analysis";
    if (phase === SCAN_PHASES.SEARCHING) return "Searching...";
    if (phase === SCAN_PHASES.CHECKING_POSITION) return "Adjust Position";
    if (phase === SCAN_PHASES.COLLECTING) return "Measuring...";
    if (phase === SCAN_PHASES.CALIBRATING) return "Calibrating";
    return "Initializing";
  };

  return (
    <div className="sf-camera-dominant-container">
      <div className="sf-video-wrapper-v2">
        <video 
          ref={videoRef} 
          className="sf-video-element-v2" 
          playsInline 
          autoPlay 
          muted 
        />
        <canvas 
          ref={canvasRef} 
          className="sf-canvas-overlay-v2"
        />
        
        {/* Top Status Bar */}
        <div className="sf-camera-top-bar">
          <div className="sf-top-status">
            <span className="sf-pulse-dot" /> {getTopStatus()}
          </div>
          <div className="sf-top-confidence">
            {Math.round(confidence.overall)}%
          </div>
        </div>

        {/* Dynamic Overlays */}
        <AnimatePresence>
          {phase === SCAN_PHASES.CALIBRATING && (
            <motion.div 
              className="sf-calibration-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="sf-card-outline">
                 <span>Place Debit/Credit Card Here</span>
              </div>
              <button className="sf-btn-primary sf-mt-md" onClick={() => completeCalibration(85.6 / 300)}>Capture Calibration</button>
            </motion.div>
          )}

          {(phase === SCAN_PHASES.SEARCHING || phase === SCAN_PHASES.CHECKING_POSITION || phase === SCAN_PHASES.COLLECTING) && (
            <motion.div 
              className="sf-hand-guide-v2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
               <div className="sf-guide-bracket top-left" />
               <div className="sf-guide-bracket top-right" />
               <div className="sf-guide-bracket bottom-left" />
               <div className="sf-guide-bracket bottom-right" />
               
               {errorMsg && (
                 <div className="sf-instruction-bubble">
                   <Info size={16} /> {errorMsg}
                 </div>
               )}
            </motion.div>
          )}

          {phase === SCAN_PHASES.CALCULATING && (
            <motion.div 
              className="sf-processing-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="sf-proc-content">
                <CheckCircle2 size={32} color="#10b981" className="sf-mb-sm" />
                <h3>Hand Detected</h3>
                
                <div className="sf-proc-steps">
                  <div className={`sf-proc-step ${processingStep >= 0 ? 'active' : ''}`}>
                    Analyzing landmarks...
                  </div>
                  <div className={`sf-proc-step ${processingStep >= 1 ? 'active' : ''}`}>
                    Calculating scale...
                  </div>
                  <div className={`sf-proc-step ${processingStep >= 2 ? 'active' : ''}`}>
                    Matching size...
                  </div>
                  <div className={`sf-proc-step ${processingStep >= 3 ? 'active' : ''}`}>
                    Generating recommendation...
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Metric Chips */}
        {phase !== SCAN_PHASES.CALCULATING && phase !== SCAN_PHASES.CALIBRATING && (
          <div className="sf-metrics-container">
            {getStatusChip('Pose', confidence.pose)}
            {getStatusChip('Lighting', confidence.lighting)}
            {getStatusChip('Stability', confidence.stability)}
            {getStatusChip('Visibility', confidence.visibility)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraScanner;
