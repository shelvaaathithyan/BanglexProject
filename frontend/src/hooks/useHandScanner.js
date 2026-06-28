import { useState, useEffect, useRef, useCallback } from 'react';
import { extractMeasurements } from '../utils/handScannerPipeline/measurementExtraction';
import { smoothLandmarks } from '../utils/handScannerPipeline/smoothing';
import { validateLandmarkVisibility } from '../utils/handScannerPipeline/landmarkValidation';
import { validateFoldedPose } from '../utils/handScannerPipeline/poseValidation';
import { analyzeMeasurements } from '../utils/handScannerPipeline/statisticalAnalysis';
import { checkLighting, calculateConfidence } from '../utils/handScannerPipeline/confidence';
import { estimatePhysicalSize, calibrateWithCard } from '../utils/calibrationUtils';
import { calculateBangleSize } from '../utils/bangleSizeCalculator';

const Hands = window.Hands;
const Camera = window.Camera;

export const SCAN_PHASES = {
  SELECT_MODE: 'SELECT_MODE',
  CALIBRATING: 'CALIBRATING',
  INITIALIZING: 'INITIALIZING',
  SEARCHING: 'SEARCHING',
  CHECKING_POSITION: 'CHECKING_POSITION',
  COLLECTING: 'COLLECTING',
  CALCULATING: 'CALCULATING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR'
};

export const useHandScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // High-level state
  const [phase, setPhase] = useState(SCAN_PHASES.SELECT_MODE);
  const [scanMode, setScanMode] = useState(null); // 'QUICK' or 'HIGH_ACCURACY'
  const [calibrationScale, setCalibrationScale] = useState(null); // mm per pixel
  
  // Live feedback state
  const [confidence, setConfidence] = useState({ overall: 0, pose: 0, lighting: 0, stability: 0, visibility: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0); // 0 to 100 based on frame buffer size
  
  // Result state
  const [result, setResult] = useState(null);
  
  // Refs for tracking
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const isDestroyed = useRef(false);
  const measurementBufferRef = useRef([]);
  const previousLandmarksRef = useRef(null);
  const frameCountRef = useRef(0);
  
  // Stability tracking
  const [stabilityScore, setStabilityScore] = useState(0);

  const destroyResources = useCallback(() => {
    isDestroyed.current = true;
    
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });
      videoRef.current.srcObject = null;
    }
    
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [videoRef, canvasRef]);

  const reset = useCallback(() => {
    setPhase(SCAN_PHASES.SELECT_MODE);
    setScanMode(null);
    setCalibrationScale(null);
    setConfidence({ overall: 0, pose: 0, lighting: 0, stability: 0, visibility: 0 });
    setResult(null);
    setErrorMsg('');
    setProgress(0);
    measurementBufferRef.current = [];
    previousLandmarksRef.current = null;
    frameCountRef.current = 0;
  }, []);

  useEffect(() => {
    return () => destroyResources();
  }, [destroyResources]);

  const selectMode = (mode) => {
    setScanMode(mode);
    if (mode === 'HIGH_ACCURACY') {
      setPhase(SCAN_PHASES.CALIBRATING);
    } else {
      startScanner();
    }
  };

  const completeCalibration = (scale) => {
    if (scale) setCalibrationScale(scale);
    startScanner();
  };

  const startScanner = useCallback(async () => {
    isDestroyed.current = false;
    setPhase(SCAN_PHASES.INITIALIZING);
    setErrorMsg('');
    measurementBufferRef.current = [];
    previousLandmarksRef.current = null;
    frameCountRef.current = 0;
    
    try {
      handsRef.current = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      
      handsRef.current.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      handsRef.current.onResults(onResults);

      if (!videoRef.current) throw new Error("Video element not found");

      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (!isDestroyed.current && handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720
      });

      await cameraRef.current.start();
      if (!isDestroyed.current) {
        setPhase(SCAN_PHASES.SEARCHING);
      }
    } catch (error) {
      console.error("Scanner init error:", error);
      setErrorMsg("Could not access camera. Please check permissions and try again.");
      setPhase(SCAN_PHASES.ERROR);
      destroyResources();
    }
  }, [videoRef, canvasRef, destroyResources]);

  const onResults = useCallback((results) => {
    if (isDestroyed.current || phase === SCAN_PHASES.COMPLETE) return;

    frameCountRef.current += 1;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current || !videoRef.current) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setPhase(SCAN_PHASES.SEARCHING);
      setErrorMsg("Place Your Hand Here");
      return;
    }

    if (results.multiHandLandmarks.length > 1) {
      setPhase(SCAN_PHASES.CHECKING_POSITION);
      setErrorMsg("Please show only one hand.");
      return;
    }

    let landmarks = results.multiHandLandmarks[0];
    
    // 1. Landmark Smoothing
    landmarks = smoothLandmarks(landmarks, previousLandmarksRef.current);
    previousLandmarksRef.current = landmarks;

    // Optional: Draw landmarks
    drawElegantLandmarks(ctx, landmarks, canvasRef.current.width, canvasRef.current.height);

    // 2. Validation
    const vis = validateLandmarkVisibility(landmarks);
    if (!vis.isValid) {
      setPhase(SCAN_PHASES.CHECKING_POSITION);
      setErrorMsg("Keep entire hand visible (wrist, thumb, pinky).");
      return;
    }

    const pose = validateFoldedPose(landmarks);
    if (!pose.isCorrectPose) {
      setPhase(SCAN_PHASES.CHECKING_POSITION);
      setErrorMsg(pose.reason);
      return;
    }

    // Stability Calculation
    let currentStability = 100;
    if (previousLandmarksRef.current && frameCountRef.current > 1) {
       // Check movement of wrist over last frame
       const dx = landmarks[0].x - previousLandmarksRef.current[0].x;
       const dy = landmarks[0].y - previousLandmarksRef.current[0].y;
       const dist = Math.sqrt(dx*dx + dy*dy);
       if (dist > 0.02) currentStability = 50; // Too much movement
       else if (dist > 0.01) currentStability = 80;
    }
    setStabilityScore(currentStability);

    if (currentStability < 70) {
      setPhase(SCAN_PHASES.CHECKING_POSITION);
      setErrorMsg("Please keep your hand steady.");
      return;
    }

    // 3. Periodic Lighting Check
    let lightScore = confidence.lighting;
    if (frameCountRef.current % 10 === 0) {
      const light = checkLighting(videoRef.current, canvasRef.current);
      if (light.score < 60) {
        setPhase(SCAN_PHASES.CHECKING_POSITION);
        setErrorMsg(light.reason);
        return;
      }
      lightScore = light.score;
    }

    // 4. Update Confidence
    if (frameCountRef.current % 15 === 0) {
      const overall = calculateConfidence(100, lightScore, pose.score, currentStability);
      setConfidence({
        overall,
        pose: pose.score,
        lighting: lightScore,
        stability: currentStability,
        visibility: 100
      });
    }

    // 5. Collect Measurements
    setPhase(SCAN_PHASES.COLLECTING);
    setErrorMsg('');
    const measurements = extractMeasurements(landmarks);
    measurementBufferRef.current.push(measurements);

    const bufferSize = measurementBufferRef.current.length;
    setProgress(Math.min((bufferSize / 150) * 100, 100));

    // Adaptive Scan Time Logic
    if (bufferSize >= 150 || (bufferSize >= 60 && currentStability >= 98)) {
      setPhase(SCAN_PHASES.CALCULATING);
      processFinalResult();
    }

  }, [phase, canvasRef, videoRef, confidence, calibrationScale]);

  const drawElegantLandmarks = (ctx, landmarks, width, height) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 2;
    const connect = (i1, i2) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[i1].x * width, landmarks[i1].y * height);
      ctx.lineTo(landmarks[i2].x * width, landmarks[i2].y * height);
      ctx.stroke();
    };
    // Basic structural lines for visual feedback
    connect(0, 1); connect(1, 2); connect(2, 3); connect(3, 4);
    connect(0, 5); connect(5, 9); connect(9, 13); connect(13, 17); connect(0, 17);
    ctx.restore();
  };

  const processFinalResult = () => {
    const stats = analyzeMeasurements(measurementBufferRef.current);
    if (!stats || !stats.isValid) {
      // Failed consistency check (average vs median varied too much)
      setErrorMsg("Measurements were inconsistent. Restarting scan...");
      setTimeout(() => {
        setPhase(SCAN_PHASES.SEARCHING);
        measurementBufferRef.current = [];
        setProgress(0);
      }, 2000);
      return;
    }

    let estimatedMm = 0;
    if (scanMode === 'HIGH_ACCURACY' && calibrationScale) {
       // Using card scale: calibrationScale is mm/pixel. We need pixel width of palm.
       // Note: stats.averageWidthNorm is normalized. To get pixels we multiply by video width.
       // However, since we used normalized distance, calibrationScale should ideally be mm / normalizedUnit.
       estimatedMm = stats.averageWidthNorm * calibrationScale;
    } else {
       // Fallback heuristic
       estimatedMm = estimatePhysicalSize(stats.averageWidthNorm, stats.avgHandLengthNorm);
    }

    const finalSize = calculateBangleSize(estimatedMm);
    
    // History Check
    const history = JSON.parse(sessionStorage.getItem('sizeScanHistory') || '[]');
    let shouldRescan = false;
    if (history.length > 0) {
      const lastScan = history[history.length - 1];
      const sizeDiff = Math.abs(parseFloat(lastScan.size) - parseFloat(finalSize.size));
      if (sizeDiff > 0.2) { // Differs by more than 1 adjacent size (2.2, 2.4)
        shouldRescan = true;
      }
    }

    if (shouldRescan && history.length < 3) {
      setErrorMsg("Measurements differ from previous scan. Let's do one more for accuracy.");
      history.push(finalSize);
      sessionStorage.setItem('sizeScanHistory', JSON.stringify(history));
      
      setTimeout(() => {
        setPhase(SCAN_PHASES.SEARCHING);
        measurementBufferRef.current = [];
        setProgress(0);
      }, 3000);
      return;
    }

    history.push(finalSize);
    sessionStorage.setItem('sizeScanHistory', JSON.stringify(history));

    setResult({
      ...finalSize,
      innerDiameter: estimatedMm.toFixed(1),
      confidenceStars: Math.max(1, Math.min(5, Math.floor(confidence.overall / 20)))
    });
    setPhase(SCAN_PHASES.COMPLETE);
    destroyResources();
  };

  return {
    videoRef,
    canvasRef,
    phase,
    scanMode,
    confidence,
    progress,
    result,
    errorMsg,
    selectMode,
    completeCalibration,
    startScanner,
    destroyResources,
    reset
  };
};
