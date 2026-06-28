import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';

const steps = [
  { id: 'intro', label: 'Intro', title: 'Introduction', subtitle: 'Find your perfect bangle size' },
  { id: 'mode', label: 'Mode', title: 'Scan Mode', subtitle: 'Select your preferred scanning method.' },
  { id: 'guide', label: 'Guide', title: 'Instructions', subtitle: 'Prepare for the best accuracy.' },
  { id: 'scan', label: 'Scan', title: 'Camera Scan', subtitle: 'Position your hand inside the guide.' },
  { id: 'ai', label: 'AI', title: 'Processing', subtitle: 'Analyzing measurements...' },
  { id: 'result', label: 'Result', title: 'Scan Complete', subtitle: 'Your recommended size is ready.' }
];

const GlobalStepper = ({ currentStepIndex, onPrev, onNext }) => {
  const currentStepData = steps[Math.min(currentStepIndex, steps.length - 1)];

  return (
    <div className="sf-stepper-wrapper">
      <div className="sf-stepper-header-container">
        <div className="sf-stepper-track-v3">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <div className={`sf-step-node-v3 ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isUpcoming ? 'upcoming' : ''}`}>
                  <motion.div 
                    className="sf-node-circle-v3"
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <Check size={20} className="sf-check-icon-v3" />
                      </motion.div>
                    )}
                    {isActive && (
                      <motion.div 
                        className="sf-node-inner-dot-v3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {isUpcoming && <span className="sf-node-number-v3">{idx + 1}</span>}
                  </motion.div>
                </div>
                
                {idx < steps.length - 1 && (
                  <div className="sf-stepper-line-container-v3">
                    <motion.div 
                      className="sf-stepper-line-fill-v3"
                      initial={{ width: '0%' }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <motion.div 
          className="sf-step-title-container-v3"
          key={currentStepData.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="sf-step-title-text-v3">Step {currentStepIndex + 1}</div>
          <h2 className="sf-step-main-title-v3">{currentStepData.title}</h2>
          <p className="sf-step-subtitle-v3">{currentStepData.subtitle}</p>
        </motion.div>
        
        {/* Buttons (Hidden on Result step) */}
        {currentStepIndex < steps.length - 1 && (
          <div className="sf-stepper-navigation-v3">
            <button 
              className="sf-btn-prev-v3" 
              onClick={onPrev} 
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft size={18} /> Previous
            </button>
            <button 
              className="sf-btn-next-v3" 
              onClick={onNext}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalStepper;
