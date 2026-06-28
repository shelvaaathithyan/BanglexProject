import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCAN_PHASES } from '../../hooks/useHandScanner';
import { CheckCircle2, AlertTriangle, XCircle, Info, Maximize, Loader2, Camera as CameraIcon } from 'lucide-react';

const CameraScanner = ({ scannerHook, localMode }) => {
  const { 
    videoRef,
    canvasRef,
    phase, 
    setPhase,
    confidence,
    errorMsg,
    completeCalibration,
    startScanner,
    setScanMode
  } = scannerHook;

  const [processingStep, setProcessingStep] = useState(0);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log('[CameraScanner] Mounted. localMode:', localMode);
    console.log('[CameraScanner] videoRef.current exists:', !!videoRef.current);
    console.log('[CameraScanner] window.Hands:', typeof window.Hands);
    console.log('[CameraScanner] window.Camera:', typeof window.Camera);

    // Set the scan mode in the hook state
    if (localMode) {
      setScanMode(localMode);
    }

    // Always start the camera immediately so the user sees a live feed
    console.log('[CameraScanner] Calling startScanner() directly...');
    startScanner().then(() => {
      console.log('[CameraScanner] startScanner() resolved. Phase should be SEARCHING now.');
      // For HIGH_ACCURACY, after camera is running, show calibration overlay on top
      if (localMode === 'HIGH_ACCURACY') {
        console.log('[CameraScanner] Setting phase to CALIBRATING for card calibration.');
        setPhase(SCAN_PHASES.CALIBRATING);
      }
    }).catch(err => {
      console.error('[CameraScanner] startScanner() failed:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === SCAN_PHASES.CALCULATING) {
      if (videoRef.current) videoRef.current.pause(); 
      
      const t1 = setTimeout(() => setProcessingStep(1), 1000);
      const t2 = setTimeout(() => setProcessingStep(2), 2000);
      const t3 = setTimeout(() => setProcessingStep(3), 3000);
      
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(e => console.error("Could not resume video:", e));
      }
      setProcessingStep(0);
    }
  }, [phase, videoRef]);

  // Debug: log phase changes
  useEffect(() => {
    console.log('[CameraScanner] Phase changed to:', phase);
  }, [phase]);

  const getMetricProgressWidth = (score) => {
    return `${Math.min(100, Math.max(0, score))}%`;
  };

  const getMetricColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const FloatingMetric = ({ title, score, goodMsg, warnMsg, position }) => {
    let status = 'error';
    if (score >= 80) status = 'good';
    else if (score >= 50) status = 'warning';
    
    let msg = warnMsg;
    if (status === 'good') msg = goodMsg;

    return (
      <div className={`sf-floating-metric-card ${position}`}>
        <div className="sf-fmc-icon">
          {status === 'good' && <CheckCircle2 size={14} color="#10b981" />}
          {status === 'warning' && <AlertTriangle size={14} color="#f59e0b" />}
          {status === 'error' && <XCircle size={14} color="#ef4444" />}
        </div>
        <div className="sf-fmc-content">
          <span className="sf-fmc-title">{title}</span>
          <span className="sf-fmc-status" style={{ color: getMetricColor(score) }}>{msg}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="sf-camera-container-v4">
      
      {/* 85% Width Camera Viewport */}
      <div className="sf-video-wrapper-v4">
        <video 
          ref={videoRef} 
          className="sf-video-element-v4" 
          playsInline 
          autoPlay 
          muted 
        />
        <canvas 
          ref={canvasRef} 
          className="sf-canvas-overlay-v3"
        />
        
        {/* Modern HUD Overlay */}
        <AnimatePresence>
          {(phase === SCAN_PHASES.SEARCHING || phase === SCAN_PHASES.CHECKING_POSITION || phase === SCAN_PHASES.COLLECTING) && (
            <motion.div 
              className="sf-hud-overlay-v3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
               {/* Minimal Glowing Guide */}
               <div className="sf-glowing-scan-frame" />
               <div className="sf-hud-bracket top-left" />
               <div className="sf-hud-bracket top-right" />
               <div className="sf-hud-bracket bottom-left" />
               <div className="sf-hud-bracket bottom-right" />
               
               {/* Scanning Pulse line */}
               {phase === SCAN_PHASES.COLLECTING && (
                 <div className="sf-scan-pulse-line" />
               )}

               {/* Top Left Status */}
               <div className="sf-top-left-status">
                 <div className="sf-pulse-dot-v3" /> 
                 <div className="sf-tl-status-text">
                   <span className="sf-tl-primary">{phase === SCAN_PHASES.COLLECTING ? "Scanning..." : "Searching"}</span>
                   <span className="sf-tl-secondary">{phase === SCAN_PHASES.COLLECTING ? "Hold Steady" : "Looking for Hand"}</span>
                 </div>
               </div>

               {/* Top Right Confidence */}
               <div className="sf-top-right-confidence">
                 <svg className="sf-conf-ring" viewBox="0 0 36 36">
                   <path
                     className="sf-conf-ring-bg"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                   />
                   <path
                     className="sf-conf-ring-fill"
                     strokeDasharray={`${Math.round(confidence.overall)}, 100`}
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                   />
                 </svg>
                 <div className="sf-conf-value">
                   <span className="sf-conf-num">{Math.round(confidence.overall)}%</span>
                   <span className="sf-conf-lbl">Confidence</span>
                 </div>
               </div>

               {/* Center Instruction Pill */}
               <div className="sf-instruction-pill-v4">
                 {errorMsg ? errorMsg : "Place your palm inside the guide"}
               </div>

               {/* Floating Status Cards */}
               <div className="sf-floating-metrics-container">
                 <FloatingMetric title="Hand Position" score={confidence.pose} goodMsg="Ready" warnMsg="Fold Thumb" position="pos-1" />
                 <FloatingMetric title="Lighting" score={confidence.lighting} goodMsg="Excellent" warnMsg="Adjust Light" position="pos-2" />
                 <FloatingMetric title="Visibility" score={confidence.visibility} goodMsg="Good" warnMsg="Show Hand" position="pos-3" />
                 <FloatingMetric title="Stability" score={confidence.stability} goodMsg="Stable" warnMsg="Hold Steady" position="pos-4" />
               </div>
            </motion.div>
          )}

          {/* Calibration Overlay */}
          {phase === SCAN_PHASES.CALIBRATING && (
            <motion.div 
              className="sf-calibration-overlay-v3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="sf-card-outline-v3">
                 <Maximize size={32} />
                 <span>Place Debit/Credit Card Here</span>
              </div>
              <button className="sf-btn-primary sf-mt-xl" onClick={() => completeCalibration(85.6 / 300)}>
                <CameraIcon size={18} /> Capture Calibration
              </button>
            </motion.div>
          )}

          {/* Processing Timeline Overlay */}
          {phase === SCAN_PHASES.CALCULATING && (
            <motion.div 
              className="sf-processing-overlay-v3"
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            >
              <div className="sf-proc-content-v3">
                <div className="sf-proc-icon-wrap">
                  <Loader2 size={40} className="sf-spin-icon" color="#d4af37" />
                </div>
                <h3>Analyzing Hand Data</h3>
                
                <div className="sf-timeline-v4">
                  <div className={`sf-tl-step-v4 ${processingStep >= 0 ? 'active' : ''}`}>
                    <div className="sf-tl-dot-v4" /> 
                    <span className="sf-tl-text-v4">Detecting</span>
                  </div>
                  <div className={`sf-tl-step-v4 ${processingStep >= 1 ? 'active' : ''}`}>
                    <div className="sf-tl-dot-v4" /> 
                    <span className="sf-tl-text-v4">Calibrating</span>
                  </div>
                  <div className={`sf-tl-step-v4 ${processingStep >= 2 ? 'active' : ''}`}>
                    <div className="sf-tl-dot-v4" /> 
                    <span className="sf-tl-text-v4">Measuring</span>
                  </div>
                  <div className={`sf-tl-step-v4 ${processingStep >= 3 ? 'active' : ''}`}>
                    <div className="sf-tl-dot-v4" /> 
                    <span className="sf-tl-text-v4">Generating Result</span>
                  </div>
                </div>
                <div className="sf-proc-time">
                  Estimated time remaining: {Math.max(1, 4 - processingStep)}s
                </div>
              </div>
            </motion.div>
          )}

          {/* Initializing Overlay */}
          {(phase === SCAN_PHASES.SELECT_MODE || phase === SCAN_PHASES.INITIALIZING) && (
            <motion.div 
              className="sf-processing-overlay-v3"
              style={{ background: 'rgba(15,23,42,0.85)', zIndex: 50 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="sf-proc-content-v3" style={{ color: 'white', textAlign: 'center' }}>
                <Loader2 size={40} className="sf-spin-icon" color="#d4af37" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: 'white' }}>Starting Camera...</h3>
                <p style={{ opacity: 0.7, marginTop: 8 }}>Please allow camera permissions if prompted.</p>
              </div>
            </motion.div>
          )}

          {/* Error Overlay */}
          {phase === SCAN_PHASES.ERROR && (
            <motion.div 
              className="sf-processing-overlay-v3"
              style={{ background: 'rgba(15,23,42,0.9)', zIndex: 50 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="sf-proc-content-v3" style={{ color: 'white', textAlign: 'center' }}>
                <AlertTriangle size={40} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: 'white' }}>Camera Error</h3>
                <p style={{ color: '#fca5a5', marginTop: 8, maxWidth: 400 }}>
                  {errorMsg || 'Could not access camera. Please check permissions and try again.'}
                </p>
                <button 
                  className="sf-btn-primary" 
                  style={{ marginTop: 24 }}
                  onClick={() => {
                    hasInitialized.current = false;
                    startScanner();
                  }}
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Removed old bottom metrics bar completely */}

    </div>
  );
};

export default CameraScanner;
