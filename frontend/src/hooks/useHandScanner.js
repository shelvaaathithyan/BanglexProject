import { useState, useEffect, useRef, useCallback } from 'react';
import { analyzeHandQuality, HAND_LANDMARKS, calculateDistance2D } from '../utils/landmarkUtils';
import { estimatePhysicalSize } from '../utils/calibrationUtils';
import { calculateBangleSize } from '../utils/bangleSizeCalculator';

const Hands = window.Hands;
const Camera = window.Camera;

export const SCAN_PHASES = {
  INITIALIZING: 'INITIALIZING',
  SEARCHING: 'SEARCHING',
  FOUND: 'FOUND',
  CHECKING_POSITION: 'CHECKING_POSITION',
  STABILIZING: 'STABILIZING',
  MEASURING: 'MEASURING',
  CALCULATING: 'CALCULATING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR'
};

export const useHandScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(SCAN_PHASES.INITIALIZING);
  const [qualityScore, setQualityScore] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const isDestroyed = useRef(false);
  const measurementsRef = useRef([]);

  // Cleanup function to strictly garbage collect all media/AI resources
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
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [videoRef, canvasRef]);

  const reset = useCallback(() => {
    setPhase(SCAN_PHASES.INITIALIZING);
    setQualityScore(0);
    setCountdown(null);
    setResult(null);
    setErrorMsg('');
  }, []);

  useEffect(() => {
    return () => {
      destroyResources(); // Cleanup on unmount
    };
  }, [destroyResources]);

  const startScanner = useCallback(async () => {
    isDestroyed.current = false;
    setPhase(SCAN_PHASES.INITIALIZING);
    setErrorMsg('');
    measurementsRef.current = [];
    
    try {
      // 1. Initialize MediaPipe Hands
      handsRef.current = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      
      handsRef.current.setOptions({
        maxNumHands: 2, // We allow 2 to detect and reject multiple hands
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      handsRef.current.onResults(onResults);

      // 2. Initialize Camera
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
  }, [videoRef, canvasRef]);

  const onResults = useCallback((results) => {
    if (isDestroyed.current || phase === SCAN_PHASES.COMPLETE) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current || !videoRef.current) return;

    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setPhase(SCAN_PHASES.SEARCHING);
      setQualityScore(0);
      setCountdown(null);
      return;
    }

    if (results.multiHandLandmarks.length > 1) {
      setPhase(SCAN_PHASES.ERROR);
      setErrorMsg("Please show only one hand.");
      setQualityScore(0);
      setCountdown(null);
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const handedness = results.multiHandedness[0];

    // Optional: Could enforce palm facing based on handedness and x-coordinates, 
    // but MediaPipe usually tracks palm robustly enough for this MVP.
    
    // Draw elegant custom landmarks
    drawElegantLandmarks(ctx, landmarks, canvasRef.current.width, canvasRef.current.height);

    // Analyze Quality
    const quality = analyzeHandQuality(landmarks);
    setQualityScore(quality.score);

    if (!quality.isGood) {
      setPhase(SCAN_PHASES.CHECKING_POSITION);
      setErrorMsg(quality.reason);
      setCountdown(null);
      return;
    }

    // Hand is good, start stabilizing / countdown
    setPhase(prev => {
      if (prev === SCAN_PHASES.SEARCHING || prev === SCAN_PHASES.CHECKING_POSITION) {
        return SCAN_PHASES.STABILIZING;
      }
      return prev;
    });
    setErrorMsg('');

    // Handle Countdown logic purely by collecting good frames
    // We expect ~30 frames per second. Collecting ~60 good frames = 2 seconds
    measurementsRef.current.push(landmarks);
    
    const framesCount = measurementsRef.current.length;
    if (framesCount < 20) {
      setCountdown(3);
    } else if (framesCount < 40) {
      setCountdown(2);
    } else if (framesCount < 60) {
      setCountdown(1);
    } else if (framesCount < 70) {
      setPhase(SCAN_PHASES.MEASURING);
      setCountdown(null);
    } else if (framesCount >= 70) {
      setPhase(SCAN_PHASES.CALCULATING);
      processMeasurements();
    }

  }, [phase, canvasRef, videoRef]);

  const drawElegantLandmarks = (ctx, landmarks, width, height) => {
    ctx.save();
    
    // Draw soft connecting lines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'; // Soft gold
    ctx.lineWidth = 2;
    
    // Helper to draw a line between two landmarks
    const connect = (idx1, idx2) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[idx1].x * width, landmarks[idx1].y * height);
      ctx.lineTo(landmarks[idx2].x * width, landmarks[idx2].y * height);
      ctx.stroke();
    };

    // Draw primary palm lines
    connect(0, 1); connect(1, 2); connect(2, 3); connect(3, 4); // thumb
    connect(0, 5); connect(5, 6); connect(6, 7); connect(7, 8); // index
    connect(0, 9); connect(9, 10); connect(10, 11); connect(11, 12); // middle
    connect(0, 13); connect(13, 14); connect(14, 15); connect(15, 16); // ring
    connect(0, 17); connect(17, 18); connect(18, 19); connect(19, 20); // pinky
    // Connect knuckles
    connect(5, 9); connect(9, 13); connect(13, 17);

    // Draw points
    landmarks.forEach((landmark, index) => {
      ctx.beginPath();
      ctx.arc(landmark.x * width, landmark.y * height, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#d4af37'; // Solid gold
      ctx.fill();
      
      // Draw outer glow for knuckles
      if ([5, 9, 13, 17].includes(index)) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
        ctx.fill();
      }
    });
    
    ctx.restore();
  };

  const processMeasurements = () => {
    if (isDestroyed.current) return;
    
    // Average out the measurements over the stable frames
    let totalPalmWidthNorm = 0;
    let totalHandLengthNorm = 0;
    
    // Take the last 20 frames for the most stable average
    const recentFrames = measurementsRef.current.slice(-20);
    
    recentFrames.forEach(landmarks => {
      const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP];
      const pinkyMcp = landmarks[HAND_LANDMARKS.PINKY_MCP];
      const wrist = landmarks[HAND_LANDMARKS.WRIST];
      const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP];
      
      totalPalmWidthNorm += calculateDistance2D(indexMcp, pinkyMcp);
      totalHandLengthNorm += calculateDistance2D(wrist, middleTip);
    });
    
    const avgPalmWidthNorm = totalPalmWidthNorm / recentFrames.length;
    const avgHandLengthNorm = totalHandLengthNorm / recentFrames.length;
    
    const estimatedMm = estimatePhysicalSize(avgPalmWidthNorm, avgHandLengthNorm);
    const bangleSizeResult = calculateBangleSize(estimatedMm);
    
    setResult({
      ...bangleSizeResult,
      innerDiameter: estimatedMm.toFixed(1)
    });
    setPhase(SCAN_PHASES.COMPLETE);
    destroyResources(); // Auto destroy immediately after result!
  };

  return {
    videoRef,
    canvasRef,
    phase,
    qualityScore,
    countdown,
    result,
    errorMsg,
    startScanner,
    destroyResources,
    reset
  };
};
