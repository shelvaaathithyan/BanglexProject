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
  CAMERA: 3, // AI Processing overlay also lives in here
  RESULT: 4
};

const SizeFinder = () => {
  const [currentStep, setCurrentStep] = useState(WIZARD_STEPS.INTRO);
  const scannerHook = useHandScanner();

  useEffect(() => {
    // When scanner hook hits COMPLETE, automatically jump to RESULT step
    if (scannerHook.phase === SCAN_PHASES.COMPLETE && scannerHook.result) {
      setCurrentStep(WIZARD_STEPS.RESULT);
    }
  }, [scannerHook.phase, scannerHook.result]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.RESULT));
  
  const handleRetry = () => {
    setCurrentStep(WIZARD_STEPS.INTRO);
    scannerHook.destroyResources();
    scannerHook.reset();
  };

  const handleSelectMode = (mode) => {
    scannerHook.selectMode(mode);
    handleNext();
  };

  return (
    <div className="sf-page-root">
      <Navbar />
      
      <div className="sf-wizard-layout">
        <GlobalStepper 
          currentStepIndex={currentStep} 
          onNext={handleNext}
          onPrev={() => setCurrentStep(prev => Math.max(prev - 1, WIZARD_STEPS.INTRO))}
        />

        <div className="sf-wizard-content">
          {currentStep === WIZARD_STEPS.INTRO && (
            <IntroStep onNext={handleNext} />
          )}

          {currentStep === WIZARD_STEPS.MODE && (
            <ModeStep onSelectMode={handleSelectMode} />
          )}

          {currentStep === WIZARD_STEPS.INSTRUCTIONS && (
            <InstructionStep onContinue={handleNext} />
          )}

          {currentStep === WIZARD_STEPS.CAMERA && (
            <div className="sf-step-container sf-camera-step-container">
              <CameraScanner scannerHook={scannerHook} />
              {scannerHook.phase !== SCAN_PHASES.CALCULATING && (
                <button className="sf-btn-secondary sf-mt-xl" onClick={handleRetry}>
                  Cancel Scan
                </button>
              )}
            </div>
          )}

          {currentStep === WIZARD_STEPS.RESULT && (
            <ResultCard result={scannerHook.result} onRetry={handleRetry} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SizeFinder;
