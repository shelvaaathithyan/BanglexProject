import React, { useState, useEffect } from 'react';
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
          disabled={currentStep === WIZARD_STEPS.INTRO}
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

        <div className="sf-wizard-content-v2">
          {currentStep === WIZARD_STEPS.INTRO && (
            <IntroStep />
          )}

          {currentStep === WIZARD_STEPS.MODE && (
            <ModeStep onSelectMode={handleSelectMode} currentMode={localMode} />
          )}

          {currentStep === WIZARD_STEPS.INSTRUCTIONS && (
            <InstructionStep />
          )}

          {currentStep === WIZARD_STEPS.CAMERA && (
            <div className="sf-step-container sf-camera-step-container">
              <CameraScanner scannerHook={scannerHook} localMode={localMode} />
            </div>
          )}

          {currentStep === WIZARD_STEPS.RESULT && (
            <ResultCard result={scannerHook.result} onRetry={handleRetry} />
          )}
        </div>

        {renderContextAwareNavigation()}
      </div>

      <Footer />
    </div>
  );
};

export default SizeFinder;
