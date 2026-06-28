import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

const InstructionStep = ({ onContinue }) => {
  return (
    <div className="sf-step-container">
      <h2 className="sf-step-title">Before Scanning</h2>
      
      <ul className="sf-elegant-checklist">
        <li><Check size={18} className="sf-check-icon" /> Good lighting</li>
        <li><Check size={18} className="sf-check-icon" /> Remove bangles</li>
        <li><Check size={18} className="sf-check-icon" /> Keep hand steady</li>
        <li><Check size={18} className="sf-check-icon" /> Fold thumb across palm</li>
      </ul>

      <hr className="sf-divider" />

      <div className="sf-privacy-block">
        <ShieldCheck size={24} className="sf-privacy-icon" />
        <div>
          <h4>Privacy Assured</h4>
          <p>Everything happens locally. Nothing is uploaded. Camera closes automatically.</p>
        </div>
      </div>

      <button className="sf-btn-primary sf-mt-xl" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
};

export default InstructionStep;
