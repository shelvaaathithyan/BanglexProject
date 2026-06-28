import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalStepper from '../components/sizeFinder/GlobalStepper';
import IntroStep from '../components/sizeFinder/IntroStep';
import ModeStep from '../components/sizeFinder/ModeStep';
import InstructionStep from '../components/sizeFinder/InstructionStep';
import CameraScanner from '../components/sizeFinder/CameraScanner';
import ResultCard from '../components/sizeFinder/ResultCard';
import { useHandScanner, SCAN_PHASES } from '../hooks/useHandScanner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/sizeFinder.css';

const WIZARD_STEPS = {
  INTRO: 0,
  MODE: 1,
  INSTRUCTIONS: 2,
  CAMERA: 3, // Processing is now just a state inside here
  RESULT: 4
};

const SizeFinder = () => {
  const [currentStep, setCurrentStep] = useState(WIZARD_STEPS.INTRO);
  const [localMode, setLocalMode] = useState(null); // Keep mode local until camera mounts
  const scannerHook = useHandScanner();

  useEffect(() => {
    // When scanner hook hits COMPLETE, automatically jump to RESULT step
    if (scannerHook.phase === SCAN_PHASES.COMPLETE && scannerHook.result) {
      setCurrentStep(WIZARD_STEPS.RESULT);
    }
  }, [scannerHook.phase, scannerHook.result]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.RESULT));
  
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, WIZARD_STEPS.INTRO));

  const handleRetry = () => {
    setCurrentStep(WIZARD_STEPS.INTRO);
    setLocalMode(null);
    scannerHook.destroyResources();
    scannerHook.reset();
  };

  const handleSelectMode = (mode) => {
    setLocalMode(mode);
  };

  const renderContextAwareNavigation = () => {
    if (currentStep === WIZARD_STEPS.RESULT) {
      return null; // Result step has its own buttons
    }
    
    if (currentStep === WIZARD_STEPS.INTRO) {
      return null; // Intro step now has its own CTA button
    }

    if (currentStep === WIZARD_STEPS.CAMERA) {
      return (
        <div className="sf-context-nav">
          <button className="sf-btn-secondary" onClick={handlePrev}>
            Previous
          </button>
          {scannerHook.phase !== SCAN_PHASES.CALCULATING && (
            <button className="sf-btn-cancel" onClick={handleRetry}>
              Cancel Scan
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="sf-context-nav">
        <button 
          className="sf-btn-secondary" 
          onClick={handlePrev}
        >
          Previous
        </button>
        <button 
          className="sf-btn-primary" 
          onClick={handleNext}
          disabled={currentStep === WIZARD_STEPS.MODE && !localMode}
        >
          Continue
        </button>
      </div>
    );
  };

  return (
    <div className="sf-page-root">
      <Navbar />
      
      <div className="sf-wizard-layout-v2">
        <GlobalStepper currentStepIndex={currentStep} />

        <div className="sf-wizard-content-v4">
          <AnimatePresence mode="wait">
            {currentStep === WIZARD_STEPS.INTRO && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <IntroStep onNext={handleNext} />
              </motion.div>
            )}

            {currentStep === WIZARD_STEPS.MODE && (
              <motion.div key="mode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <ModeStep onSelectMode={handleSelectMode} currentMode={localMode} />
              </motion.div>
            )}

            {currentStep === WIZARD_STEPS.INSTRUCTIONS && (
              <motion.div key="instructions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <InstructionStep />
              </motion.div>
            )}

            {currentStep === WIZARD_STEPS.CAMERA && (
              <motion.div key="camera" className="sf-step-container sf-camera-step-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.5 }}>
                <CameraScanner scannerHook={scannerHook} localMode={localMode} />
              </motion.div>
            )}

            {currentStep === WIZARD_STEPS.RESULT && (
              <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6 }}>
                <ResultCard result={scannerHook.result} onRetry={handleRetry} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {renderContextAwareNavigation()}
      </div>

      <Footer />
    </div>
  );
};

export default SizeFinder;
